from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.models.wing import Wing
from app.models.activity import Activity
from app.models.photo import Photo


class CRUDService:
    """Generic CRUD operations service."""
    
    # Wing Operations
    
    @staticmethod
    async def get_all_wings(session: AsyncSession) -> List[Wing]:
        """Get all wings."""
        result = await session.execute(select(Wing))
        return result.scalars().all()
    
    @staticmethod
    async def get_wing_by_id(session: AsyncSession, wing_id: int) -> Optional[Wing]:
        """Get wing by ID."""
        result = await session.execute(
            select(Wing).where(Wing.id == wing_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_wing_by_slug(session: AsyncSession, slug: str) -> Optional[Wing]:
        """Get wing by slug."""
        result = await session.execute(
            select(Wing).where(Wing.slug == slug)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_wing_with_relations(
        session: AsyncSession,
        slug: str
    ) -> Optional[Wing]:
        """Get wing by slug with activities and photos."""
        result = await session.execute(
            select(Wing)
            .where(Wing.slug == slug)
            .options(
                selectinload(Wing.activities),
                selectinload(Wing.photos)
            )
        )
        return result.scalar_one_or_none()
    
    # Activity Operations
    
    @staticmethod
    async def get_activities_by_wing(
        session: AsyncSession,
        wing_id: int,
        limit: int = 100
    ) -> List[Activity]:
        """Get activities for a wing, sorted by date descending."""
        result = await session.execute(
            select(Activity)
            .where(Activity.wing_id == wing_id)
            .order_by(Activity.activity_date.desc())
            .limit(limit)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_activity_by_id(
        session: AsyncSession,
        activity_id: int
    ) -> Optional[Activity]:
        """Get activity by ID."""
        result = await session.execute(
            select(Activity).where(Activity.id == activity_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create_activity(
        session: AsyncSession,
        activity: Activity
    ) -> Activity:
        """Create a new activity."""
        session.add(activity)
        await session.commit()
        await session.refresh(activity)
        return activity
    
    @staticmethod
    async def update_activity(
        session: AsyncSession,
        activity_id: int,
        update_data: dict
    ) -> Optional[Activity]:
        """Update an activity."""
        activity = await CRUDService.get_activity_by_id(session, activity_id)
        if not activity:
            return None
        
        for key, value in update_data.items():
            if value is not None:
                setattr(activity, key, value)
        
        await session.commit()
        await session.refresh(activity)
        return activity
    
    @staticmethod
    async def delete_activity(
        session: AsyncSession,
        activity_id: int
    ) -> bool:
        """Delete an activity."""
        result = await session.execute(
            delete(Activity).where(Activity.id == activity_id)
        )
        await session.commit()
        return result.rowcount > 0
    
    # Photo Operations
    
    @staticmethod
    async def get_photos_by_wing(
        session: AsyncSession,
        wing_id: int,
        limit: int = 100,
        offset: int = 0
    ) -> List[Photo]:
        """Get photos for a wing with pagination."""
        result = await session.execute(
            select(Photo)
            .where(Photo.wing_id == wing_id)
            .order_by(Photo.uploaded_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_latest_photos_by_wing(
        session: AsyncSession,
        wing_id: int,
        limit: int = 10
    ) -> List[Photo]:
        """Get latest photos for a wing (for slideshow)."""
        return await CRUDService.get_photos_by_wing(session, wing_id, limit=limit)
    
    @staticmethod
    async def create_photo(
        session: AsyncSession,
        photo: Photo
    ) -> Photo:
        """Create a new photo entry."""
        session.add(photo)
        await session.commit()
        await session.refresh(photo)
        return photo
    
    @staticmethod
    async def create_photos_bulk(
        session: AsyncSession,
        photos: List[Photo]
    ) -> List[Photo]:
        """Create multiple photo entries."""
        session.add_all(photos)
        await session.commit()
        for photo in photos:
            await session.refresh(photo)
        return photos
    
    @staticmethod
    async def get_photo_by_id(
        session: AsyncSession,
        photo_id: int
    ) -> Optional[Photo]:
        """Get photo by ID."""
        result = await session.execute(
            select(Photo).where(Photo.id == photo_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def delete_photo(
        session: AsyncSession,
        photo_id: int
    ) -> bool:
        """Delete a photo."""
        result = await session.execute(
            delete(Photo).where(Photo.id == photo_id)
        )
        await session.commit()
        return result.rowcount > 0
