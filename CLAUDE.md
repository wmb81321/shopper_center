@AGENTS.md

# Shopper Admin — Project Context

## Stack
- Next.js 16.2.2 (App Router) — see AGENTS.md for breaking changes
- Supabase (PostgreSQL + Auth) — project ID: `jfhxmmkwdedmlixhogae`
- shadcn/ui + Tailwind CSS
- TypeScript

## Key conventions

### Route protection
Next.js 16 uses `src/proxy.ts` (not `middleware.ts` — that name is deprecated and will cause a build error).
The proxy exports a named `proxy` function (not `middleware`). Auth check uses `supabase.auth.getUser()`.

### Supabase clients
- Browser: `@/lib/supabase/client` → `createBrowserClient`
- Server (RSC, Route Handlers): `@/lib/supabase/server` → `createServerClient`

### Auth flow
Google OAuth → `/auth/callback` exchanges code → session cookie → `/dashboard`
Always exclude `/auth/*` paths from redirect guards in `proxy.ts`.

### Admin pages
All admin routes live under `src/app/(admin)/` and share the layout with AppSidebar.

## Campaign context (Mundial Colombia 2026)
Products: Combo Pareja, Combo Parceros, Combo Amigas, Camiseta Hombre, Body Mujer
Sales channel: WhatsApp + Meta Ads
Payment: Contraentrega. Envío gratis. 5 días.

## What's built
- `/products` — price management + promo toggle
- `/ads` — copy caption, toggle active/paused
- `/segments` — read-only Meta Ads targeting per product
- `/benefits` — editable delivery config
- `/playbook` — WhatsApp sales scripts (6 funnel stages)
- `/orders`, `/conversations`, `/config` — existing views
