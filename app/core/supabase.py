from supabase import create_client

from app.core.config import settings


# Cliente público: almacenamiento y operaciones que no requieren privilegios de administrador.
supabase = create_client(
    settings.supabase_url,
    settings.supabase_key,
)

# Cliente exclusivo del backend: operaciones administrativas de Supabase Auth.
# La Service Role Key nunca debe exponerse al frontend.
supabase_admin = create_client(
    settings.supabase_url,
    settings.supabase_service_role_key,
)
