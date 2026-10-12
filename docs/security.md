# Seguridad

## Controles implementados

- Sesiones Supabase SSR validadas con `getClaims()`.
- Rutas privadas con redirección temprana y revalidación cerca de los datos.
- RLS habilitado en todas las tablas de `public`.
- Policies por operación y rol; no se usa `user_metadata` para autorizar.
- `organization_id` derivado en servidor, nunca confiado desde formularios.
- Constraints y FKs compuestas contra asociaciones cross-tenant.
- Server Actions tratadas como endpoints públicos: autenticación, autorización, Zod y DTO mínimo.
- `service_role` ausente del código cliente y de `.env.example`.
- Headers contra framing y MIME sniffing; política de cámara limitada al mismo origen.
- Auditoría para onboarding; movimientos futuros serán inmutables.

## Funciones SECURITY DEFINER

| Función | Motivo | Restricción |
| --- | --- | --- |
| `private.is_organization_member` | Evita recursión RLS. | Esquema no expuesto; sólo `authenticated`, `search_path=''`. |
| `private.has_organization_role` | Decisión de rol centralizada. | Esquema no expuesto; sólo `authenticated`, `search_path=''`. |
| `private.shares_organization` | Permite nombres de compañeros. | Esquema no expuesto; sólo `authenticated`, devuelve booleano. |
| `create_organization_with_owner` | Alta atómica e idempotente. | Sólo `authenticated`; deriva `auth.uid()`. |
| Triggers privados | Integridad de perfiles, owners y timestamps. | Esquema `private` sin acceso API. |

## Riesgos y siguientes controles

- Configurar rate limiting en el borde para login, recuperación e invitaciones.
- Activar MFA y políticas de contraseña adecuadas al riesgo del cliente.
- Añadir CSP con nonces cuando se definan integraciones externas.
- Revisar dependencias y resultados de RLS en CI.
- Implementar reautenticación para cambios de Owner y acciones destructivas.
- Definir retención, exportación y alertas de `audit_logs`.

La publishable key no es un secreto; RLS es el perímetro de datos. Una `service_role` sí es secreta y nunca debe exponerse al navegador.
