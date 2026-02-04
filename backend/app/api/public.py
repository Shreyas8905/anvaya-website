"""
Public API routes for the Anvaya frontend.
Provides read-only endpoints for wings, activities, photos, and statistics.
"""

from collections import defaultdict
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.exceptions import NotFoundError
from app.services.crud import CRUDService
from app.schemas.wing import WingResponse, WingWithRelations
from app.schemas.activity import ActivityResponse
from app.schemas.photo import PhotoResponse

# =============================================================================
# Router Setup
# =============================================================================

router = APIRouter()

# =============================================================================
# Wing Endpoints
# =============================================================================

@router.get("/wings", response_model=List[WingResponse])
async def get_all_wings(
    session: AsyncSession = Depends(get_session)
) -> List[WingResponse]:
    """
    Get all wings.
    
    Returns a list of all available wings in the system.
    """
    wings = await CRUDService.get_all_wings(session)
    return wings


@router.get("/wings/{slug}", response_model=WingWithRelations)
async def get_wing_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session)
) -> WingWithRelations:
    """
    Get a wing by its slug with related activities and photos.
    
    Args:
        slug: The unique slug identifier for the wing.
        
    Returns:
        Wing data with associated activities and photos.
        
    Raises:
        NotFoundError: If the wing does not exist.
    """
    wing = await CRUDService.get_wing_with_relations(session, slug)
    
    if not wing:
        raise NotFoundError("Wing", slug=slug)
    
    return wing


@router.get("/wings/{slug}/photos", response_model=List[PhotoResponse])
async def get_wing_photos(
    slug: str,
    limit: int = Query(default=100, ge=1, le=500, description="Maximum photos to return"),
    offset: int = Query(default=0, ge=0, description="Number of photos to skip"),
    session: AsyncSession = Depends(get_session)
) -> List[PhotoResponse]:
    """
    Get photos for a wing with pagination.
    
    Args:
        slug: The wing's slug identifier.
        limit: Maximum number of photos to return (1-500).
        offset: Number of photos to skip for pagination.
        
    Returns:
        List of photos for the specified wing.
        
    Raises:
        NotFoundError: If the wing does not exist.
    """
    wing = await CRUDService.get_wing_by_slug(session, slug)
    
    if not wing:
        raise NotFoundError("Wing", slug=slug)
    
    photos = await CRUDService.get_photos_by_wing(
        session, wing.id, limit=limit, offset=offset
    )
    return photos


@router.get("/wings/{slug}/activities", response_model=List[ActivityResponse])
async def get_wing_activities(
    slug: str,
    session: AsyncSession = Depends(get_session)
) -> List[ActivityResponse]:
    """
    Get all activities for a wing.
    
    Args:
        slug: The wing's slug identifier.
        
    Returns:
        List of activities sorted by date (newest first).
        
    Raises:
        NotFoundError: If the wing does not exist.
    """
    wing = await CRUDService.get_wing_by_slug(session, slug)
    
    if not wing:
        raise NotFoundError("Wing", slug=slug)
    
    activities = await CRUDService.get_activities_by_wing(session, wing.id)
    return activities


# =============================================================================
# Activity Endpoints
# =============================================================================

@router.get("/activities/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    session: AsyncSession = Depends(get_session)
) -> ActivityResponse:
    """
    Get a single activity by ID.
    
    Args:
        activity_id: The unique identifier for the activity.
        
    Returns:
        The activity data.
        
    Raises:
        NotFoundError: If the activity does not exist.
    """
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    
    if not activity:
        raise NotFoundError("Activity", identifier=str(activity_id))
    
    return activity


@router.get("/activities", response_model=List[ActivityResponse])
async def get_all_activities(
    limit: int = Query(default=1000, ge=1, le=5000, description="Maximum activities to return"),
    session: AsyncSession = Depends(get_session)
) -> List[ActivityResponse]:
    """
    Get all activities across all wings.
    
    Args:
        limit: Maximum number of activities to return (1-5000).
        
    Returns:
        List of all activities sorted by date (newest first).
    """
    activities = await CRUDService.get_all_activities(session, limit=limit)
    return activities


# =============================================================================
# Statistics Endpoints
# =============================================================================

@router.get("/statistics/activities")
async def get_activity_statistics(
    year: Optional[int] = Query(
        default=None,
        ge=2000,
        le=2100,
        description="Filter statistics by year"
    ),
    session: AsyncSession = Depends(get_session)
) -> dict:
    """
    Get activity statistics grouped by wing.
    
    Args:
        year: Optional year to filter statistics (2000-2100).
        
    Returns:
        Statistics object containing:
        - statistics: List of wing statistics with activity counts
        - available_years: List of years with data
        - filtered_year: The year filter applied (if any)
    """
    # Get all activities with wing information
    activities_with_wings = await CRUDService.get_all_activities_with_wings(session)
    
    # Group by wing and count
    wing_stats: dict = defaultdict(lambda: {"name": "", "slug": "", "count": 0})
    years_set: set = set()
    
    for activity, wing in activities_with_wings:
        activity_year = activity.activity_date.year
        years_set.add(activity_year)
        
        # Filter by year if specified
        if year is not None and activity_year != year:
            continue
        
        wing_stats[wing.id]["name"] = wing.name
        wing_stats[wing.id]["slug"] = wing.slug
        wing_stats[wing.id]["count"] += 1
    
    # Convert to list and sort by count descending
    statistics = [
        {
            "wing_id": wing_id,
            "wing_name": data["name"],
            "wing_slug": data["slug"],
            "activity_count": data["count"],
        }
        for wing_id, data in wing_stats.items()
    ]
    statistics.sort(key=lambda x: x["activity_count"], reverse=True)
    
    # Get available years sorted descending
    available_years = sorted(list(years_set), reverse=True)
    
    return {
        "statistics": statistics,
        "available_years": available_years,
        "filtered_year": year,
    }
