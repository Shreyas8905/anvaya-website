import cloudinary
import cloudinary.uploader
from typing import List, Dict
from fastapi import UploadFile
from app.config import get_settings

settings = get_settings()

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret
)


async def upload_image(file: UploadFile, folder: str = "anvaya") -> Dict[str, str]:
    """
    Upload an image to Cloudinary.
    
    Args:
        file: The image file to upload
        folder: Cloudinary folder path
    
    Returns:
        Dict with 'url' and 'public_id'
    """
    try:
        # Read file contents
        contents = await file.read()
        
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="image"
        )
        
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    finally:
        await file.seek(0)  # Reset file pointer


async def upload_images_bulk(files: List[UploadFile], folder: str = "anvaya") -> List[Dict[str, str]]:
    """
    Upload multiple images to Cloudinary.
    
    Args:
        files: List of image files
        folder: Cloudinary folder path
    
    Returns:
        List of dicts with 'url' and 'public_id' for each image
    """
    results = []
    for file in files:
        result = await upload_image(file, folder)
        results.append(result)
    return results


async def upload_pdf(file: UploadFile, folder: str = "anvaya/reports") -> Dict[str, str]:
    """
    Upload a PDF file to Cloudinary.
    
    Args:
        file: The PDF file to upload
        folder: Cloudinary folder path
    
    Returns:
        Dict with 'url' and 'public_id'
    """
    try:
        # Read file contents
        contents = await file.read()
        
        # Upload to Cloudinary as raw/PDF
        result = cloudinary.uploader.upload(
            contents,
            folder=folder,
            resource_type="raw",
            format="pdf"
        )
        
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }
    finally:
        await file.seek(0)


def delete_media(public_id: str, resource_type: str = "image") -> bool:
    """
    Delete media from Cloudinary.
    
    Args:
        public_id: Cloudinary public_id of the media
        resource_type: Type of resource ('image' or 'raw' for PDFs)
    
    Returns:
        True if successful
    """
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type=resource_type)
        return result.get("result") == "ok"
    except Exception:
        return False
