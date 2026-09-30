from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings
from app.core.supabase import supabase


class StorageService:

    ALLOWED_CONTENT_TYPES = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
    }

    def upload_menu_image(self, file: UploadFile, menu_item_id: int) -> str:
        if file.content_type not in self.ALLOWED_CONTENT_TYPES:
            raise ValueError(
                "El archivo debe ser una imagen JPG, PNG o WEBP"
            )

        extension = self.ALLOWED_CONTENT_TYPES[file.content_type]

        file_path = f"menu/{menu_item_id}-{uuid4()}.{extension}"

        file_data = file.file.read()

        supabase.storage.from_(settings.supabase_bucket).upload(
            file_path,
            file_data,
            {
                "content-type": file.content_type,
            },
        )

        return supabase.storage.from_(
            settings.supabase_bucket
        ).get_public_url(file_path)