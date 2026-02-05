import logging
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.wing import Wing
from app.models.activity import Activity
from app.models.photo import Photo

logger = logging.getLogger(__name__)


class CRUDService:
    @staticmethod
    async def get_all_wings(session: AsyncSession) -> List[Wing]:
        result = await session.execute(select(Wing))
        return list(result.scalars().all())
    
    @staticmethod
    async def get_wing_by_id(session: AsyncSession, wing_id: int) -> Optional[Wing]:
        result = await session.execute(
            select(Wing).where(Wing.id == wing_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_wing_by_slug(session: AsyncSession, slug: str) -> Optional[Wing]:
        result = await session.execute(
            select(Wing).where(Wing.slug == slug)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_wing_with_relations(
        session: AsyncSession,
        slug: str
    ) -> Optional[Wing]:
        result = await session.execute(
            select(Wing)
            .where(Wing.slug == slug)
            .options(
                selectinload(Wing.activities),
                selectinload(Wing.photos)
            )
        )
        wing = result.scalar_one_or_none()
        
        if not wing:
            return None
        
        wing.activities.sort(key=lambda x: x.activity_date, reverse=True)
        wing.photos.sort(key=lambda x: x.uploaded_at, reverse=True)
        
        return wing
    
    @staticmethod
    async def get_activities_by_wing(
        session: AsyncSession,
        wing_id: int,
        limit: int = 100
    ) -> List[Activity]:
        result = await session.execute(
            select(Activity)
            .where(Activity.wing_id == wing_id)
            .order_by(Activity.activity_date.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_activity_by_id(
        session: AsyncSession,
        activity_id: int
    ) -> Optional[Activity]:
        result = await session.execute(
            select(Activity).where(Activity.id == activity_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_activity(
        session: AsyncSession,
        activity: Activity
    ) -> Activity:
        try:
            session.add(activity)
            await session.commit()
            await session.refresh(activity)
            logger.debug(f"Created activity: {activity.id}")
            return activity
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to create activity: {e}")
            raise
    
    @staticmethod
    async def update_activity(
        session: AsyncSession,
        activity_id: int,
        update_data: Dict[str, Any]
    ) -> Optional[Activity]:
        activity = await CRUDService.get_activity_by_id(session, activity_id)
        if not activity:
            return None
        
        try:
            for key, value in update_data.items():
                if hasattr(activity, key):
                    setattr(activity, key, value)
            
            await session.commit()
            await session.refresh(activity)
            logger.debug(f"Updated activity: {activity_id}")
            return activity
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to update activity {activity_id}: {e}")
            raise
    
    @staticmethod
    async def delete_activity(
        session: AsyncSession,
        activity_id: int
    ) -> bool:
        try:
            result = await session.execute(
                delete(Activity).where(Activity.id == activity_id)
            )
            await session.commit()
            deleted = result.rowcount > 0
            if deleted:
                logger.debug(f"Deleted activity: {activity_id}")
            return deleted
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to delete activity {activity_id}: {e}")
            raise
    
    @staticmethod
    async def get_all_activities(
        session: AsyncSession,
        limit: int = 1000
    ) -> List[Activity]:
        result = await session.execute(
            select(Activity)
            .order_by(Activity.activity_date.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_all_activities_with_wings(
        session: AsyncSession
    ) -> List[Tuple[Activity, Wing]]:
        result = await session.execute(
            select(Activity, Wing)
            .join(Wing, Activity.wing_id == Wing.id)
            .order_by(Activity.activity_date.desc())
        )
        return list(result.all())
    
    @staticmethod
    async def get_photos_by_wing(
        session: AsyncSession,
        wing_id: int,
        limit: int = 100,
        offset: int = 0
    ) -> List[Photo]:
        result = await session.execute(
            select(Photo)
            .where(Photo.wing_id == wing_id)
            .order_by(Photo.uploaded_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def get_latest_photos_by_wing(
        session: AsyncSession,
        wing_id: int,
        limit: int = 10
    ) -> List[Photo]:
        return await CRUDService.get_photos_by_wing(session, wing_id, limit=limit)
    
    @staticmethod
    async def get_photo_by_id(
        session: AsyncSession,
        photo_id: int
    ) -> Optional[Photo]:
        result = await session.execute(
            select(Photo).where(Photo.id == photo_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_photo(
        session: AsyncSession,
        photo: Photo
    ) -> Photo:
        try:
            session.add(photo)
            await session.commit()
            await session.refresh(photo)
            logger.debug(f"Created photo: {photo.id}")
            return photo
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to create photo: {e}")
            raise
    
    @staticmethod
    async def create_photos_bulk(
        session: AsyncSession,
        photos: List[Photo]
    ) -> List[Photo]:
        try:
            session.add_all(photos)
            await session.commit()
            
            for photo in photos:
                await session.refresh(photo)
            
            logger.debug(f"Created {len(photos)} photos in bulk")
            return photos
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to create photos bulk: {e}")
            raise
    
    @staticmethod
    async def delete_photo(
        session: AsyncSession,
        photo_id: int
    ) -> bool:
        try:
            result = await session.execute(
                delete(Photo).where(Photo.id == photo_id)
            )
            await session.commit()
            deleted = result.rowcount > 0
            if deleted:
                logger.debug(f"Deleted photo: {photo_id}")
            return deleted
        except Exception as e:
            await session.rollback()
            logger.error(f"Failed to delete photo {photo_id}: {e}")
            raise
