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

router = APIRouter()


@router.get("/wings", response_model=List[WingResponse])
async def get_all_wings(
    session: AsyncSession = Depends(get_session)
) -> List[WingResponse]:
    wings = await CRUDService.get_all_wings(session)
    return wings


@router.get("/wings/{slug}", response_model=WingWithRelations)
async def get_wing_by_slug(
    slug: str,
    session: AsyncSession = Depends(get_session)
) -> WingWithRelations:
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
    wing = await CRUDService.get_wing_by_slug(session, slug)
    
    if not wing:
        raise NotFoundError("Wing", slug=slug)
    
    activities = await CRUDService.get_activities_by_wing(session, wing.id)
    return activities


@router.get("/activities/{activity_id}", response_model=ActivityResponse)
async def get_activity(
    activity_id: int,
    session: AsyncSession = Depends(get_session)
) -> ActivityResponse:
    activity = await CRUDService.get_activity_by_id(session, activity_id)
    
    if not activity:
        raise NotFoundError("Activity", identifier=str(activity_id))
    
    return activity


@router.get("/activities", response_model=List[ActivityResponse])
async def get_all_activities(
    limit: int = Query(default=1000, ge=1, le=5000, description="Maximum activities to return"),
    session: AsyncSession = Depends(get_session)
) -> List[ActivityResponse]:
    activities = await CRUDService.get_all_activities(session, limit=limit)
    return activities


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
    activities_with_wings = await CRUDService.get_all_activities_with_wings(session)
    
    wing_stats: dict = defaultdict(lambda: {"name": "", "slug": "", "count": 0})
    years_set: set = set()
    
    for activity, wing in activities_with_wings:
        activity_year = activity.activity_date.year
        years_set.add(activity_year)
        
        if year is not None and activity_year != year:
            continue
        
        wing_stats[wing.id]["name"] = wing.name
        wing_stats[wing.id]["slug"] = wing.slug
        wing_stats[wing.id]["count"] += 1
    
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
    
    available_years = sorted(list(years_set), reverse=True)
    
    return {
        "statistics": statistics,
        "available_years": available_years,
        "filtered_year": year,
    }
