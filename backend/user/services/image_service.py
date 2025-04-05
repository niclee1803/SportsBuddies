import os
import tempfile
import time
from fastapi import UploadFile, HTTPException
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv


load_dotenv()
cloudinary.config( 
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

class ImageService:
    """Service for image processing and storage"""
    
    @staticmethod
    async def upload_profile_picture(file: UploadFile, user_id: str) -> str:
        """Upload profile picture to Cloudinary"""
        try:
            # Read file contents
            contents = await file.read()
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(contents)
                temp_file_path = temp_file.name
            
            # Upload to Cloudinary with optimizations
            upload_result = cloudinary.uploader.upload(
                temp_file_path,
                public_id=f"profiles/{user_id}",
                overwrite=True,
                resource_type="image",
                transformation=[
                    {"width": 400, "height": 400, "crop": "fill", "gravity": "face"},
                    {"fetch_format": "auto"},
                    {"quality": "auto"}
                ]
            )
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            # Return the optimized URL from Cloudinary
            return upload_result["secure_url"]
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Image upload failed: {str(e)}")

    @staticmethod
    async def upload_banner_image(file: UploadFile, user_id: str) -> str:
        """Upload banner image to Cloudinary"""
        try:
            # Read file contents
            contents = await file.read()
            
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                temp_file.write(contents)
                temp_file_path = temp_file.name
            
            # Upload to Cloudinary with optimizations for banner images
            upload_result = cloudinary.uploader.upload(
                temp_file_path,
                public_id=f"banners/{user_id}_{int(time.time())}",  # unique ID for each banner
                overwrite=True,
                resource_type="image",
                transformation=[
                    {"width": 1200, "height": 400, "crop": "fill"},  # banner dimensions
                    {"fetch_format": "auto"},
                    {"quality": "auto"}
                ]
            )
            
            # Clean up the temporary file
            os.unlink(temp_file_path)
            
            # Return the optimized URL from Cloudinary
            return upload_result["secure_url"]
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload banner: {str(e)}")