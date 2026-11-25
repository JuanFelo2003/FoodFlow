# FoodFlow Frontend

Aplicación web de gestión de restaurantes construida con React, TypeScript, Vite y React Router.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm
- Backend FoodFlow ejecutándose en `http://127.0.0.1:8000`

## Configuración

1. Instala las dependencias:

   ```bash
   npm ci
   ```

2. Crea el archivo `.env` a partir de `.env.example`:

   ```env
   VITE_API_URL=/api
   ```

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

Vite reenvía las solicitudes `/api` al backend local. Si el backend se ejecuta en otra dirección, actualiza `frontend/vite.config.ts`.

## Verificaciones

```bash
npm run build
```

## Roles

- `admin`: empleados, menú, mesas, pedidos, cuentas y pagos.
- `waiter`: menú, mesas, pedidos y generación/ajuste de cuentas.
- `cashier`: consulta de mesas y pedidos, consulta de cuentas y registro/anulación de pagos.
- `kitchen`: menú y panel de cocina con actualización periódica cada cinco segundos.

Las imágenes del menú aceptan JPG, PNG y WEBP, con un límite de 5 MB.

## Estilos

Los colores y tokens visuales están centralizados en `src/styles/variables.css`. Los estilos se organizan en archivos por componentes, estructura y páginas.
