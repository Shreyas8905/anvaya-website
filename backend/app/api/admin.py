from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import date
from app.database import get_session
from app.services.auth import verify_admin_credentials, create_access_token, get_current_admin
from app.services.cloudinary import upload_images_bulk, upload_pdf, delete_media
from app.services.crud import CRUDService
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.schemas.photo import PhotoResponse
from app.models.activity import Activity
from app.models.photo import Photo

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def admin_login(credentials: LoginRequest):
    """Admin login endpoint."""
    if not verify_admin_credentials(credentials.username, credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT token
    access_token = create_access_token(data={"sub": credentials.username})
    return TokenResponse(access_token=access_token)


@router.post("/photos", response_model=List[PhotoResponse])
async def upload_photos(
    wing_id: int = Form(...),
    files: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
):
    """Bulk upload photos to a wing (admin only)."""
    # Verify wing exists
    wing = await CRUDService.get_wing_by_id(session, wing_id)
    if not wing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wing with ID {wing_id} not found"
        )
    
    # Upload to Cloudinary
    folder = f"anvaya/{wing.slug}"
    uploaded_files = await upload_images_bulk(files, folder)
    
    # Create photo entries in database
    photos = []
    for upload_result in uploaded_files:
        photo = Photo(
            wing_id=wing_id,
            url=upload_result["url"],
            cloudinary_id=upload_result["public_id"]
        )
        photos.append(photo)
    
    created_photos = await CRUDService.create_photos_bulk(session, photos)
    return created_photos


@router.delete("/photos/{photo_id}")
async def delete_photo(
    photo_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
):
    """Delete a photo (admin only)."""
    # Get photo
    photo = await CRUDService.get_photo_by_id(session, photo_id)
    if not photo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Photo with ID {photo_id} not found"
        )
    
    # Delete from Cloudinary
    delete_media(photo.cloudinary_id, resource_type="image")
    
    # Delete from database
    await CRUDService.delete_photo(session, photo_id)
    
    return {"message": "Photo deleted successfully"}


@router.post("/activities", response_model=ActivityResponse)
async def create_activity(
    wing_id: int = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    activity_date: date = Form(...),
    report_file: UploadFile = File(None),
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
):
    """Create a new activity with optional PDF report (admin only)."""
    # Verify wing exists
    wing = await CRUDService.get_wing_by_id(session, wing_id)
    if not wing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wing with ID {wing_id} not found"
        )
    
    # Upload PDF if provided
    report_url = None
    report_cloudinary_id = None
    if report_file:
        folder = f"anvaya/{wing.slug}/reports"
        upload_result = await upload_pdf(report_file, folder)
        report_url = upload_result["url"]
        report_cloudinary_id = upload_result["public_id"]
    
    # Create activity
    activity = Activity(
        wing_id=wing_id,
        title=title,
        description=description,
        activity_date=activity_date,
        report_url=report_url,
        report_cloudinary_id=report_cloudinary_id
    )
    
    created_activity = await CRUDService.create_activity(session, activity)
    return created_activity


@router.put("/activities/{activity_id}", response_model=ActivityResponse)
async def update_activity(
    activity_id: int,
    title: str = Form(None),
    description: str = Form(None),
    activity_date: date = Form(None),
    report_file: UploadFile = File(None),
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
):
    """Update an activity (admin only)."""
    # Get existing activity
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found"
        )
    
    # Prepare update data
    update_data = {}
    if title:
        update_data["title"] = title
    if description:
        update_data["description"] = description
    if activity_date:
        update_data["activity_date"] = activity_date
    
    # Upload new PDF if provided
    if report_file:
        # Delete old PDF if exists
        if activity.report_cloudinary_id:
            delete_media(activity.report_cloudinary_id, resource_type="raw")
        
        # Upload new PDF
        wing = await CRUDService.get_wing_by_id(session, activity.wing_id)
        folder = f"anvaya/{wing.slug}/reports"
        upload_result = await upload_pdf(report_file, folder)
        update_data["report_url"] = upload_result["url"]
        update_data["report_cloudinary_id"] = upload_result["public_id"]
    
    # Update activity
    updated_activity = await CRUDService.update_activity(
        session, activity_id, update_data
    )
    return updated_activity


@router.delete("/activities/{activity_id}")
async def delete_activity(
    activity_id: int,
    session: AsyncSession = Depends(get_session),
    current_admin: dict = Depends(get_current_admin)
):
    """Delete an activity (admin only)."""
    # Get activity
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found"
        )
    
    # Delete PDF from Cloudinary if exists
    if activity.report_cloudinary_id:
        delete_media(activity.report_cloudinary_id, resource_type="raw")
    
    # Delete from database
    await CRUDService.delete_activity(session, activity_id)
    
    return {"message": "Activity deleted successfully"}
