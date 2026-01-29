from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.database import get_session
from app.services.crud import CRUDService
from app.schemas.wing import WingResponse, WingWithRelations
from app.schemas.activity import ActivityResponse
from app.schemas.photo import PhotoResponse

router = APIRouter()


@router.get("/wings", response_model=List[WingResponse])
async def get_all_wings(session: AsyncSession = Depends(get_session)):
    """Get all wings."""
    wings = await CRUDService.get_all_wings(session)
    return wings


@router.get("/wings/{slug}", response_model=WingWithRelations)
async def get_wing_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session)
):
    """Get wing by slug with activities and photos."""
    wing = await CRUDService.get_wing_with_relations(session, slug)
    if not wing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wing with slug '{slug}' not found"
        )
    return wing


@router.get("/wings/{slug}/photos", response_model=List[PhotoResponse])
async def get_wing_photos(
    slug: str,
    limit: int = 100,
    offset: int = 0,
    session: AsyncSession = Depends(get_session)
):
    """Get photos for a wing with pagination."""
    wing = await CRUDService.get_wing_by_slug(session, slug)
    if not wing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wing with slug '{slug}' not found"
        )
    
    photos = await CRUDService.get_photos_by_wing(
        session, wing.id, limit=limit, offset=offset
    )
    return photos


@router.get("/wings/{slug}/activities", response_model=List[ActivityResponse])
async def get_wing_activities(
    slug: str,
    session: AsyncSession = Depends(get_session)
):
    """Get activities for a wing."""
    wing = await CRUDService.get_wing_by_slug(session, slug)
    if not wing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wing with slug '{slug}' not found"
        )
    
    activities = await CRUDService.get_activities_by_wing(session, wing.id)
    return activities


@router.get("/activities/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Get a single activity by ID."""
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Activity with ID {activity_id} not found"
        )
    return activity
