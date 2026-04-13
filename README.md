# Shopper Admin — Ekinoxis

Panel de administración para la campaña de ventas WhatsApp + Meta Ads de Ekinoxis (Mundial Colombia 2026).

## Stack

- **Framework:** Next.js 15 App Router
- **Base de datos y auth:** Supabase (PostgreSQL + Auth)
- **UI:** shadcn/ui + Tailwind CSS
- **Lenguaje:** TypeScript

## Funcionalidades

| Ruta | Descripción |
|---|---|
| `/dashboard` | Vista general |
| `/products` | Catálogo con control de precios y toggle promo |
| `/orders` | Órdenes de clientes |
| `/conversations` | Conversaciones de WhatsApp |
| `/ads` | Anuncios por producto — copiar caption, activar/pausar |
| `/segments` | Segmentación Meta Ads por producto (read-only) |
| `/benefits` | Configuración de entrega — editable |
| `/playbook` | Playbook de ventas WhatsApp con scripts copiables |
| `/config` | Configuración del agente AI |

## Autenticación

Google OAuth via Supabase Auth. Solo cuentas autorizadas tienen acceso.

El middleware en `src/middleware.ts` protege todas las rutas del panel. Flujo:

1. Usuario no autenticado → redirige a `/login`
2. Login con Google → callback en `/auth/callback` → intercambia code por sesión
3. Redirige a `/dashboard`

## Variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

Para que Google OAuth funcione, configura el proveedor en **Supabase Dashboard → Authentication → Providers → Google** con las credenciales de Google Cloud Console y agrega la URL de callback:

```
https://tu-proyecto.supabase.co/auth/v1/callback
```

## Base de datos (Supabase)

Tablas principales:

| Tabla | Descripción |
|---|---|
| `products` | Catálogo extendido con precios promo y tipo de producto |
| `benefits` | Config de entrega: contraentrega, envío gratis, 5 días |
| `segments` | Targeting Meta Ads por producto |
| `ads` | Copys de anuncios con estado activo/pausado |
| `customers` | Clientes de WhatsApp |
| `conversations` | Conversaciones activas |
| `orders` | Órdenes creadas vía Dropi |

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin sesión activa redirige automáticamente a `/login`.
