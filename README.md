# FoodFlow

Sistema POS para la gestión básica de un restaurante.

## Tecnologías

- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT para autenticación
- Supabase Storage para imágenes del menú
- Swagger / OpenAPI

## Requisitos

- Python 3.12 o superior
- PostgreSQL
- Cuenta/proyecto de Supabase para el almacenamiento de imágenes

## Instalación

### 1. Clonar el repositorio

Clonar el repositorio y ubicarse dentro de la carpeta del proyecto.

### 2. Crear el entorno virtual

```powershell
python -m venv .venv
```

Activar el entorno virtual:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Instalar las dependencias

```powershell
pip install -r requirements.txt
```

### 4. Configurar las variables de entorno

Crear un archivo `.env` tomando como referencia `.env.example`.

El archivo debe contener las siguientes variables:

```env
DATABASE_HOST=
DATABASE_PORT=
DATABASE_NAME=
DATABASE_USER=
DATABASE_PASSWORD=
JWT_SECRET_KEY=
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_BUCKET=menu-images
```

Las credenciales reales no deben subirse al repositorio. El archivo `.env` está excluido mediante `.gitignore`.

### 5. Ejecutar las migraciones

```powershell
alembic upgrade head
```

### 6. Iniciar el servidor

```powershell
uvicorn app.main:app --reload
```

## Documentación de la API

Con el servidor en ejecución, la documentación interactiva de Swagger está disponible en:

**http://127.0.0.1:8000/docs**

## Roles del sistema

FoodFlow maneja cuatro roles:

- **Administrador**
- **Mesero**
- **Cajero**
- **Cocina**

El acceso a las operaciones está controlado mediante autenticación JWT y permisos según el rol.

## Funcionalidades principales

- Autenticación de empleados
- Gestión de empleados
- Gestión del menú
- Carga de imágenes de productos
- Gestión de mesas
- Creación y gestión de pedidos
- Gestión de productos de los pedidos
- Gestión de estados de preparación
- Generación de cuentas
- Registro y anulación de pagos
- Control de acceso por roles
- Persistencia de información en PostgreSQL

## Alcance

FoodFlow corresponde a un MVP de un sistema POS para restaurantes. Esta versión se concentra en la operación interna del restaurante.

### Fuera del alcance

- Pedidos en línea
- Pagos electrónicos
- Reservas
- Domicilios
- Inventario
- Fidelización
- Analítica y BI
- Interacción directa con clientes
