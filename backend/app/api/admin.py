import logging
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.exceptions import (
    NotFoundError,
    ValidationError,
    FileUploadError,
    ExternalServiceError,
)
from app.models.activity import Activity
from app.models.photo import Photo
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.activity import ActivityResponse
from app.schemas.photo import PhotoResponse
from app.services.auth import (
    verify_admin_credentials,
    create_access_token,
    get_current_admin,
)
from app.services.cloudinary import upload_images_bulk, upload_pdf, delete_media
from app.services.crud import CRUDService

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_PDF_EXTENSIONS = {".pdf"}

router = APIRouter()


def validate_image_file(file: UploadFile) -> None:
    if not file.filename:
        raise ValidationError("File must have a filename")
    
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise FileUploadError(
            f"Invalid image format. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}",
            filename=file.filename
        )


def validate_pdf_file(file: UploadFile) -> None:
    if not file.filename:
        raise ValidationError("File must have a filename")
    
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_PDF_EXTENSIONS:
        raise FileUploadError(
            "Invalid file format. Only PDF files are allowed.",
            filename=file.filename
        )


@router.post("/login", response_model=TokenResponse)
async def admin_login(credentials: LoginRequest) -> TokenResponse:
    if not verify_admin_credentials(credentials.username, credentials.password):
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": credentials.username})
    logger.info(f"Admin login successful: {credentials.username}")
    
    return TokenResponse(access_token=access_token)


@router.post("/photos", response_model=List[PhotoResponse])
async def upload_photos(
    wing_id: int = Form(..., description="Wing ID to upload photos to"),
    files: List[UploadFile] = File(..., description="Image files to upload"),
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
) -> List[PhotoResponse]:
    wing = await CRUDService.get_wing_by_id(session, wing_id)
    if not wing:
        raise NotFoundError("Wing", identifier=str(wing_id))
    
    for file in files:
        validate_image_file(file)
    
    logger.info(f"Uploading {len(files)} photos to wing '{wing.slug}' by {current_admin.get('sub')}")
    
    try:
        folder = f"anvaya/{wing.slug}"
        uploaded_files = await upload_images_bulk(files, folder)
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise ExternalServiceError("Cloudinary", "Failed to upload images")
    
    photos = [
        Photo(
            wing_id=wing_id,
            url=upload_result["url"],
            cloudinary_id=upload_result["public_id"]
        )
        for upload_result in uploaded_files
    ]
    
    created_photos = await CRUDService.create_photos_bulk(session, photos)
    logger.info(f"Created {len(created_photos)} photo records for wing '{wing.slug}'")
    
    return created_photos


@router.delete("/photos/{photo_id}")
async def delete_photo(
    photo_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
) -> dict:
    photo = await CRUDService.get_photo_by_id(session, photo_id)
    if not photo:
        raise NotFoundError("Photo", identifier=str(photo_id))
    
    logger.info(f"Deleting photo {photo_id} by {current_admin.get('sub')}")
    
    try:
        delete_media(photo.cloudinary_id, resource_type="image")
    except Exception as e:
        logger.warning(f"Failed to delete photo from Cloudinary: {e}")
    
    await CRUDService.delete_photo(session, photo_id)
    
    return {"message": "Photo deleted successfully"}


@router.post("/activities", response_model=ActivityResponse)
async def create_activity(
    wing_id: int = Form(..., description="Wing ID for the activity"),
    title: str = Form(..., min_length=1, max_length=200, description="Activity title"),
    description: str = Form(..., min_length=1, description="Activity description"),
    activity_date: date = Form(..., description="Date of the activity"),
    faculty_coordinator: Optional[str] = Form(None, max_length=200, description="Faculty coordinator name"),
    report_file: Optional[UploadFile] = File(None, description="Optional PDF report"),
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
) -> ActivityResponse:
    wing = await CRUDService.get_wing_by_id(session, wing_id)
    if not wing:
        raise NotFoundError("Wing", identifier=str(wing_id))
    
    report_url: Optional[str] = None
    report_cloudinary_id: Optional[str] = None
    
    if report_file and report_file.filename:
        validate_pdf_file(report_file)
        
        try:
            folder = f"anvaya/{wing.slug}/reports"
            upload_result = await upload_pdf(report_file, folder)
            report_url = upload_result["url"]
            report_cloudinary_id = upload_result["public_id"]
            logger.info(f"Uploaded report PDF for activity '{title}'")
        except Exception as e:
            logger.error(f"Failed to upload PDF: {e}")
            raise ExternalServiceError("Cloudinary", "Failed to upload PDF report")
    
    activity = Activity(
        wing_id=wing_id,
        title=title.strip(),
        description=description.strip(),
        activity_date=activity_date,
        faculty_coordinator=faculty_coordinator.strip() if faculty_coordinator else None,
        report_url=report_url,
        report_cloudinary_id=report_cloudinary_id
    )
    
    created_activity = await CRUDService.create_activity(session, activity)
    logger.info(f"Created activity '{title}' for wing '{wing.slug}' by {current_admin.get('sub')}")
    
    return created_activity


@router.put("/activities/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    title: Optional[str] = Form(None, min_length=1, max_length=200),
    description: Optional[str] = Form(None, min_length=1),
    activity_date: Optional[date] = Form(None),
    faculty_coordinator: Optional[str] = Form(None, max_length=200),
    report_file: Optional[UploadFile] = File(None),
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
) -> ActivityResponse:
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    if not activity:
        raise NotFoundError("Activity", identifier=str(activity_id))
    
    update_data: dict = {}
    
    if title is not None:
        update_data["title"] = title.strip()
    if description is not None:
        update_data["description"] = description.strip()
    if activity_date is not None:
        update_data["activity_date"] = activity_date
    if faculty_coordinator is not None:
        update_data["faculty_coordinator"] = faculty_coordinator.strip() if faculty_coordinator else None
    
    if report_file and report_file.filename:
        validate_pdf_file(report_file)
        
        if activity.report_cloudinary_id:
            try:
                delete_media(activity.report_cloudinary_id, resource_type="raw")
            except Exception as e:
                logger.warning(f"Failed to delete old PDF: {e}")
        
        try:
            wing = await CRUDService.get_wing_by_id(session, activity.wing_id)
            folder = f"anvaya/{wing.slug}/reports" if wing else "anvaya/reports"
            upload_result = await upload_pdf(report_file, folder)
            update_data["report_url"] = upload_result["url"]
            update_data["report_cloudinary_id"] = upload_result["public_id"]
        except Exception as e:
            logger.error(f"Failed to upload PDF: {e}")
            raise ExternalServiceError("Cloudinary", "Failed to upload PDF report")
    
    updated_activity = await CRUDService.update_activity(session, activity_id, update_data)
    logger.info(f"Updated activity {activity_id} by {current_admin.get('sub')}")
    
    return updated_activity


@router.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
) -> dict:
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    if not activity:
        raise NotFoundError("Activity", identifier=str(activity_id))
    
    logger.info(f"Deleting activity {activity_id} by {current_admin.get('sub')}")
    
    if activity.report_cloudinary_id:
        try:
            delete_media(activity.report_cloudinary_id, resource_type="raw")
        except Exception as e:
            logger.warning(f"Failed to delete PDF from Cloudinary: {e}")
    
    await CRUDService.delete_activity(session, activity_id)
    
    return {"message": "Activity deleted successfully"}
