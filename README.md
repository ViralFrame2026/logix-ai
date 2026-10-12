# LOGIX AI

Fundación de un SaaS B2B multiempresa para depósitos y distribuidoras. Esta fase incluye autenticación, onboarding atómico, roles, RLS, dashboard con consultas reales, navegación, estados vacíos y captura de códigos. No incluye todavía operaciones de stock completas ni llamadas a IA.

## Stack

- Next.js 16.4 con App Router, React 19 y TypeScript estricto.
- Tailwind CSS 4 y componentes shadcn/ui basados en Radix.
- Supabase Auth + PostgreSQL con Row Level Security.
- Vitest, Testing Library, Playwright y axe-core.
- Despliegue compatible con Vercel.

## Inicio rápido

Requisitos: Node.js 24+, npm 11+ y Docker sólo para el stack local de Supabase.

```bash
npm ci
cp .env.example .env.local
npm run db:start
npm run db:reset
npm run dev
```

Copiá la URL y publishable key emitidas por `supabase start` a `.env.local`. No agregues una `service_role` al frontend.

La aplicación queda en `http://localhost:3000`. Para usar un proyecto Supabase alojado, aplicá las migraciones con el flujo de despliegue de Supabase y configurá las mismas variables en tu entorno; no conectes producción desde una tarea de desarrollo.

## Verificación

```bash
npm run lint
npm run typecheck
npm test
npm run db:test   # requiere Supabase local iniciado
npm run test:e2e  # instala Chromium con: npx playwright install chromium
npm run build
```

## Variables

| Variable | Alcance | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Público | URL del proyecto Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Público | Publishable/anon key protegida por RLS. |
| `NEXT_PUBLIC_SITE_URL` | Público | Origen HTTPS canónico para callbacks; nunca `localhost` fuera de desarrollo. |

Los archivos `.env*` no se versionan salvo `.env.example`. Desarrollo, pruebas y producción deben usar proyectos y credenciales separados. En previews de Vercel, los callbacks usan primero la URL HTTPS generada por la plataforma; `NEXT_PUBLIC_SITE_URL` queda como origen canónico explícito para entornos con dominio estable.

## Rutas

- Públicas: `/login`, `/register`, `/forgot-password`, `/reset-password` y `/auth/callback`.
- Onboarding autenticado: `/onboarding`.
- Privadas: `/dashboard`, `/products`, `/inventory`, `/orders`, `/receipts`, `/movements`, `/scanner`, `/ai-assistant`, `/reports` y `/settings/*`.

`src/proxy.ts` refresca la sesión y realiza redirecciones tempranas. La autorización real se repite en la capa de datos y en las políticas RLS.

## Documentación

- [Arquitectura](docs/architecture.md)
- [Base de datos](docs/database.md)
- [Seguridad](docs/security.md)
- [Roles y permisos](docs/roles-permissions.md)
- [Pruebas](docs/testing.md)
- [Despliegue](docs/deployment.md)
- [Roadmap](docs/roadmap.md)
