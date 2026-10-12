# Pruebas

## Capas

- `npm test`: validación, permisos y componentes con Vitest/Testing Library.
- `npm run db:test`: aislamiento cross-tenant y rechazo de escritura con la CLI de Supabase.
- `npm run test:e2e`: rutas públicas, rechazo de rutas privadas, mobile y chequeo axe.
- `npm run lint`, `npm run typecheck`, `npm run build`: calidad estática y producción.

## Pruebas de base

`supabase/tests/multitenancy.sql` crea dos organizaciones dentro de una transacción que termina en rollback. Autentica al Owner A y falla si puede ver filas del tenant B o insertar un depósito en ese tenant.

Requiere Docker y el stack local:

```bash
npm run db:start
npm run db:reset
npm run db:test
```

## E2E

```bash
npx playwright install chromium
npm run test:e2e
```

Las pruebas sin credenciales verifican el comportamiento degradado seguro. Para pruebas completas de registro/onboarding se debe usar un proyecto Supabase de test separado, nunca producción.
