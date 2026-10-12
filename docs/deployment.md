# Despliegue en Vercel

1. Crear proyectos Supabase separados para preview y producción.
2. Aplicar migraciones mediante un pipeline revisado.
3. Configurar las tres variables descritas en `.env.example` por entorno.
4. Agregar en Supabase Auth las URLs de callback de preview y producción.
5. Importar el repositorio en Vercel; el framework y `npm run build` se detectan automáticamente.
6. Ejecutar pruebas contra un entorno de test antes de promover.

## Checklist

- Node.js 24 seleccionado.
- Lockfile versionado y `npm ci` exitoso.
- `NEXT_PUBLIC_SITE_URL` coincide con el dominio HTTPS.
- No existen variables `service_role` expuestas como `NEXT_PUBLIC_*`.
- RLS y pruebas cross-tenant pasan sobre el esquema aplicado.
- Registro, confirmación de email, recuperación y logout verificados.
- Logs sin secretos ni payloads sensibles.
- No hay servicios pagos o proveedor IA habilitados.

No se incluye despliegue automático ni conexión a producción en esta fase.
