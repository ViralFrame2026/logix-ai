# Base de datos

## Migraciones

1. `202610120001_foundation.sql`: organizaciones, perfiles, membresías, depósitos, ubicaciones, auditoría, helpers RLS y onboarding.
2. `202610120002_logistics_foundation.sql`: modelo operativo inicial para catálogo, inventario, pedidos, recepciones, movimientos, reservas e insights.
3. `20261012203052_harden_public_privileges.sql`: revoca grants automáticos de `anon`/`authenticated`, declara explícitamente la superficie de lectura y mueve los helpers RLS al esquema privado.

Todas las claves internas son UUID. Las tablas empresariales llevan `organization_id`, índices por acceso frecuente, timestamps y constraints. Las relaciones sensibles usan claves foráneas compuestas `(id, organization_id)` para impedir referencias cruzadas.

## Onboarding atómico

`create_organization_with_owner` es una función `SECURITY DEFINER` con `search_path = ''`, permisos revocados a `public/anon` y ejecución exclusiva de `authenticated`. En una única transacción:

1. Deriva `auth.uid()`.
2. Valida entradas nuevamente en PostgreSQL.
3. Serializa solicitudes por usuario con advisory lock.
4. Reutiliza el resultado ante el mismo `request_id`.
5. Crea organización, membresía Owner, primer depósito y auditoría.

La tabla de idempotencia vive en `private`, fuera de la API expuesta.

Los helpers usados por las policies también viven en `private`. Conservan `EXECUTE` para `authenticated` porque PostgreSQL debe evaluarlos dentro de RLS, pero no se publican como endpoints RPC.

## Escrituras de stock

`inventory_balances`, `stock_movements` y `stock_reservations` son legibles bajo RLS, pero no tienen grants de escritura para `authenticated`. Una fase posterior debe implementar una RPC transaccional que bloquee el balance, valide disponibilidad, inserte un movimiento inmutable y actualice el saldo en la misma transacción.

## Aplicación

```bash
npm run db:start
npm run db:reset
npm run db:test
```

Para un proyecto remoto, usá el pipeline oficial de Supabase y revisá el diff antes de aplicar. No ejecutes migraciones no revisadas directamente sobre producción.
