# FoodFlow

Sistema POS para la gestión de restaurantes. El proyecto incluye una API REST construida con FastAPI y una aplicación web construida con React y TypeScript.

## Tecnologías

### Backend

- Python 3.12+
- FastAPI
- PostgreSQL
- SQLAlchemy y Alembic
- Supabase Auth
- Supabase Storage
- Pydantic

### Frontend

- React
- TypeScript
- Vite
- React Router
- CSS modular con variables centralizadas

## Requisitos

- Python 3.12 o superior
- PostgreSQL
- Proyecto de Supabase con Auth y Storage configurados
- Node.js 20.19+ o 22.12+
- npm

## Configuración del backend

Desde la raíz del proyecto:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crea `.env` a partir de `.env.example` y configura las credenciales reales:

```env
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=menu-images
```

Ejecuta las migraciones:

```powershell
alembic upgrade head
```

Inicia la API:

```powershell
uvicorn app.main:app --reload
```

Swagger está disponible en `http://127.0.0.1:8000/docs`.

## Configuración del frontend

Desde la carpeta `frontend`:

```powershell
npm ci
```

Crea `frontend/.env` a partir de `frontend/.env.example`:

```env
VITE_API_URL=/api
```

Inicia la aplicación:

```powershell
npm run dev
```

El servidor de desarrollo de Vite reenvía las solicitudes `/api` a `http://127.0.0.1:8000`. Para otros entornos, configura el proxy o la URL pública del backend según el despliegue.

Verifica el frontend:

```powershell
npm run lint
npm run build
```

## Roles

- **Administrador:** gestión de empleados, menú, mesas, pedidos, cuentas y pagos. También puede supervisar cocina.
- **Mesero:** consulta del menú, gestión de mesas y pedidos, y generación/ajuste de cuentas.
- **Cajero:** consulta de operación y cuentas, registro y anulación de pagos.
- **Cocina:** consulta de pedidos en preparación y cambio de estado a servido. El panel consulta automáticamente cada cinco segundos.

La API valida los permisos en el backend; las rutas y la navegación del frontend también se adaptan al rol.

## Funcionalidades

- Autenticación y renovación de sesión con Supabase Auth.
- Gestión de empleados y roles.
- Gestión de menú e imágenes.
- Gestión de mesas y estados.
- Creación y administración de pedidos y sus productos.
- Panel de cocina con actualización periódica.
- Generación y ajuste de cuentas.
- Registro y anulación de pagos.
- Protección de rutas y manejo de errores.

## Documentación del proyecto

- `frontend/README.md`: configuración y ejecución del frontend.

## Alcance

FoodFlow es un MVP de gestión interna de restaurantes. No incluye pedidos en línea, reservas, domicilios, inventario, fidelización ni analítica/BI.
