# Despliegue en Vercel

1. Crear proyectos Supabase separados para preview y producción.
2. Aplicar migraciones mediante un pipeline revisado.
3. Configurar las variables públicas por entorno según la tabla siguiente.
4. Agregar en Supabase Auth las URLs de callback de preview y producción.
5. Importar el repositorio en Vercel; el framework y `npm run build` se detectan automáticamente.
6. Ejecutar pruebas contra un entorno de test antes de promover.

## Variables de Vercel

Configurar estas variables como `Config` y limitarlas a `Preview`. La publishable key es pública por diseño; la autorización efectiva depende de RLS.

| Variable | Preview | Observación |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Requerida | URL HTTPS del proyecto Supabase staging verificado. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Requerida | Publishable key activa del mismo proyecto staging. |
| `NEXT_PUBLIC_SITE_URL` | Opcional | Sólo para un dominio Preview estable; debe ser HTTPS y nunca `localhost`. |

No configurar `SUPABASE_ACCESS_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, claves secretas ni credenciales administrativas en Vercel. Para previews sin dominio estable, la aplicación usa primero `NEXT_PUBLIC_VERCEL_URL`/`VERCEL_URL`, provistas por Vercel, para construir los callbacks.

## Supabase Auth

Para Vercel Preview, mantener la confirmación de correo activa y agregar a **Redirect URLs**:

```text
https://*-poketrade-hub.vercel.app/**
```

La aplicación envía callbacks a `/auth/callback` para registro y recuperación. El **Site URL** de Supabase debe ser un origen HTTPS estable; no debe apuntar a `localhost` en staging. En producción se debe reemplazar el wildcard por URLs exactas y configurar `NEXT_PUBLIC_SITE_URL` con el dominio definitivo.

## Checklist

- Node.js 24 seleccionado.
- Lockfile versionado y `npm ci` exitoso.
- `NEXT_PUBLIC_SITE_URL`, cuando existe, coincide con un dominio HTTPS y no es `localhost`.
- No existen variables `service_role` expuestas como `NEXT_PUBLIC_*`.
- RLS y pruebas cross-tenant pasan sobre el esquema aplicado.
- Registro, confirmación de email, recuperación y logout verificados.
- Logs sin secretos ni payloads sensibles.
- No hay servicios pagos o proveedor IA habilitados.

No se incluye despliegue automático ni conexión a producción en esta fase.
