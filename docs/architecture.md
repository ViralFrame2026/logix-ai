# Arquitectura

## Límites

LOGIX AI usa Server Components por defecto. Los Client Components quedan limitados a formularios interactivos, navegación móvil y cámara. Las consultas y mutaciones pasan por módulos `server-only`; nunca se entrega un cliente privilegiado al navegador.

```text
Navegador
  ├─ formularios → Server Actions → DAL → Supabase (sesión del usuario + RLS)
  └─ navegación → Proxy (refresh/redirect optimista)
                                  └─ Server Components → DAL → DTO mínimo
PostgreSQL
  ├─ RLS por organization_id
  ├─ funciones de autorización
  └─ RPC atómica de onboarding
```

## Directorios

- `src/app`: rutas, layouts, Route Handlers y Server Actions.
- `src/components/ui`: componentes shadcn/ui accesibles y reutilizables.
- `src/components`: UI de dominio.
- `src/data`: capa de acceso a datos; valida sesión, organización y DTO.
- `src/lib/supabase`: clientes request-scoped y refresh de cookies.
- `src/lib/ai`: contrato desacoplado; el proveedor actual está deshabilitado.
- `supabase/migrations`: esquema, constraints, RLS y permisos.
- `supabase/tests`: pruebas de aislamiento ejecutables contra una DB local.

## Autenticación y navegación

Supabase Auth conserva la sesión en cookies mediante `@supabase/ssr`. `src/proxy.ts` usa `getClaims()` para validar la firma y refrescar tokens; nunca usa `getSession()` como prueba de identidad. El proxy no reemplaza la autorización: `requireUser` y `requireMembership` vuelven a verificarla junto a la consulta.

## Multitenancy

Cada entidad empresarial contiene `organization_id`. Las claves foráneas compuestas impiden asociar recursos de organizaciones diferentes. RLS filtra lecturas y escrituras; los Server Actions derivan la organización desde la membresía autenticada y no aceptan un `organization_id` del cliente.

## Escaneo

Código manual, lector que emula teclado y cámara convergen en `resolveProductAction`. La cámara sólo se solicita tras una acción explícita, se detiene al cerrar o resolver y dispone de alternativa manual. La captura identifica productos pero no mueve stock.

## IA

`AiProvider` define el contrato futuro. `DisabledAiProvider` falla de forma explícita: no hay llamadas pagas, respuestas inventadas ni secretos de proveedor.
