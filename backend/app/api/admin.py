"""
Admin API routes for the Anvaya backend.
Provides authenticated endpoints for managing photos and activities.
"""

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

# =============================================================================
# Configuration
# =============================================================================

logger = logging.getLogger(__name__)

# Allowed file extensions for uploads
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
ALLOWED_PDF_EXTENSIONS = {".pdf"}
MAX_FILE_SIZE_MB = 10

router = APIRouter()

# =============================================================================
# Helpers
# =============================================================================

def validate_image_file(file: UploadFile) -> None:
    """Validate an image file for upload."""
    if not file.filename:
        raise ValidationError("File must have a filename")
    
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise FileUploadError(
            f"Invalid image format. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}",
            filename=file.filename
        )


def validate_pdf_file(file: UploadFile) -> None:
    """Validate a PDF file for upload."""
    if not file.filename:
        raise ValidationError("File must have a filename")
    
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_PDF_EXTENSIONS:
        raise FileUploadError(
            "Invalid file format. Only PDF files are allowed.",
            filename=file.filename
        )

# =============================================================================
# Authentication
# =============================================================================

@router.post("/login", response_model=TokenResponse)
async def admin_login(credentials: LoginRequest) -> TokenResponse:
    """
    Authenticate an admin user.
    
    Args:
        credentials: Login username and password.
        
    Returns:
        JWT access token for authenticated requests.
        
    Raises:
        HTTPException: 401 if credentials are invalid.
    """
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

# =============================================================================
# Photo Management
# =============================================================================

@router.post("/photos", response_model=List[PhotoResponse])
async def upload_photos(
    wing_id: int = Form(..., description="Wing ID to upload photos to"),
    files: List[UploadFile] = File(..., description="Image files to upload"),
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
) -> List[PhotoResponse]:
    """
    Bulk upload photos to a wing.
    
    Args:
        wing_id: The ID of the wing to add photos to.
        files: List of image files to upload.
        
    Returns:
        List of created photo records.
        
    Raises:
        NotFoundError: If the wing does not exist.
        FileUploadError: If any file is invalid.
        ExternalServiceError: If Cloudinary upload fails.
    """
    # Validate wing exists
    wing = await CRUDService.get_wing_by_id(session, wing_id)
    if not wing:
        raise NotFoundError("Wing", identifier=str(wing_id))
    
    # Validate all files before uploading
    for file in files:
        validate_image_file(file)
    
    logger.info(f"Uploading {len(files)} photos to wing '{wing.slug}' by {current_admin.get('sub')}")
    
    # Upload to Cloudinary
    try:
        folder = f"anvaya/{wing.slug}"
        uploaded_files = await upload_images_bulk(files, folder)
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise ExternalServiceError("Cloudinary", "Failed to upload images")
    
    # Create photo entries in database
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
    """
    Delete a photo.
    
    Args:
        photo_id: The ID of the photo to delete.
        
    Returns:
        Success message.
        
    Raises:
        NotFoundError: If the photo does not exist.
    """
    photo = await CRUDService.get_photo_by_id(session, photo_id)
    if not photo:
        raise NotFoundError("Photo", identifier=str(photo_id))
    
    logger.info(f"Deleting photo {photo_id} by {current_admin.get('sub')}")
    
    # Delete from Cloudinary (best effort)
    try:
        delete_media(photo.cloudinary_id, resource_type="image")
    except Exception as e:
        logger.warning(f"Failed to delete photo from Cloudinary: {e}")
    
    # Delete from database
    await CRUDService.delete_photo(session, photo_id)
    
    return {"message": "Photo deleted successfully"}

# =============================================================================
# Activity Management
# =============================================================================

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
    """
    Create a new activity with optional PDF report.
    
    Args:
        wing_id: The wing this activity belongs to.
        title: Title of the activity.
        description: Detailed description of the activity.
        activity_date: When the activity took place.
        faculty_coordinator: Optional faculty coordinator name.
        report_file: Optional PDF report file.
        
    Returns:
        The created activity record.
        
    Raises:
        NotFoundError: If the wing does not exist.
        ValidationError: If input validation fails.
        FileUploadError: If the PDF file is invalid.
    """
    # Validate wing exists
    wing = await CRUDService.get_wing_by_id(session, wing_id)
    if not wing:
        raise NotFoundError("Wing", identifier=str(wing_id))
    
    # Upload PDF if provided
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
    
    # Create activity
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
    """
    Update an existing activity.
    
    Only provided fields will be updated.
    
    Args:
        activity_id: The ID of the activity to update.
        title: New title (optional).
        description: New description (optional).
        activity_date: New date (optional).
        faculty_coordinator: New coordinator name (optional).
        report_file: New PDF report (optional, replaces existing).
        
    Returns:
        The updated activity record.
        
    Raises:
        NotFoundError: If the activity does not exist.
        FileUploadError: If the PDF file is invalid.
    """
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    if not activity:
        raise NotFoundError("Activity", identifier=str(activity_id))
    
    # Build update data
    update_data: dict = {}
    
    if title is not None:
        update_data["title"] = title.strip()
    if description is not None:
        update_data["description"] = description.strip()
    if activity_date is not None:
        update_data["activity_date"] = activity_date
    if faculty_coordinator is not None:
        update_data["faculty_coordinator"] = faculty_coordinator.strip() if faculty_coordinator else None
    
    # Handle PDF upload
    if report_file and report_file.filename:
        validate_pdf_file(report_file)
        
        # Delete old PDF if exists
        if activity.report_cloudinary_id:
            try:
                delete_media(activity.report_cloudinary_id, resource_type="raw")
            except Exception as e:
                logger.warning(f"Failed to delete old PDF: {e}")
        
        # Upload new PDF
        try:
            wing = await CRUDService.get_wing_by_id(session, activity.wing_id)
            folder = f"anvaya/{wing.slug}/reports" if wing else "anvaya/reports"
            upload_result = await upload_pdf(report_file, folder)
            update_data["report_url"] = upload_result["url"]
            update_data["report_cloudinary_id"] = upload_result["public_id"]
        except Exception as e:
            logger.error(f"Failed to upload PDF: {e}")
            raise ExternalServiceError("Cloudinary", "Failed to upload PDF report")
    
    # Update activity
    updated_activity = await CRUDService.update_activity(session, activity_id, update_data)
    logger.info(f"Updated activity {activity_id} by {current_admin.get('sub')}")
    
    return updated_activity


@router.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
) -> dict:
    """
    Delete an activity.
    
    Also removes the associated PDF report if present.
    
    Args:
        activity_id: The ID of the activity to delete.
        
    Returns:
        Success message.
        
    Raises:
        NotFoundError: If the activity does not exist.
    """
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    if not activity:
        raise NotFoundError("Activity", identifier=str(activity_id))
    
    logger.info(f"Deleting activity {activity_id} by {current_admin.get('sub')}")
    
    # Delete PDF from Cloudinary if exists (best effort)
    if activity.report_cloudinary_id:
        try:
            delete_media(activity.report_cloudinary_id, resource_type="raw")
        except Exception as e:
            logger.warning(f"Failed to delete PDF from Cloudinary: {e}")
    
    # Delete from database
    await CRUDService.delete_activity(session, activity_id)
    
    return {"message": "Activity deleted successfully"}
