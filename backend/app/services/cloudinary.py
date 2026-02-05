import logging
from typing import Dict, List

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
)


async def upload_image(
    file: UploadFile,
    folder: str = "anvaya"
) -> Dict[str, str]:
    await file.seek(0)
    
    logger.debug(f"Uploading image to folder: {folder}")
    
    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        resource_type="image",
    )
    
    return {
        "url": result.get("secure_url", ""),
        "public_id": result.get("public_id", ""),
    }


async def upload_images_bulk(
    files: List[UploadFile],
    folder: str = "anvaya"
) -> List[Dict[str, str]]:
    results: List[Dict[str, str]] = []
    
    for file in files:
        result = await upload_image(file, folder)
        results.append(result)
    
    logger.info(f"Uploaded {len(results)} images to {folder}")
    return results


async def upload_pdf(
    file: UploadFile,
    folder: str = "anvaya/reports"
) -> Dict[str, str]:
    await file.seek(0)
    
    logger.debug(f"Uploading PDF to folder: {folder}")
    
    result = cloudinary.uploader.upload(
        file.file,
        folder=folder,
        resource_type="auto",
    )
    
    return {
        "url": result.get("secure_url", ""),
        "public_id": result.get("public_id", ""),
    }


def delete_media(
    public_id: str,
    resource_type: str = "image"
) -> bool:
    try:
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type,
        )
        success = result.get("result") == "ok"
        
        if success:
            logger.debug(f"Deleted media: {public_id}")
        else:
            logger.warning(f"Failed to delete media {public_id}: {result}")
        
        return success
    except Exception as e:
        logger.error(f"Error deleting from Cloudinary ({public_id}): {e}")
        return False
