# Roles y permisos

| Capacidad | Owner | Admin | Manager | Operator | Viewer |
| --- | :---: | :---: | :---: | :---: | :---: |
| Configurar organización | Sí | No | No | No | No |
| Gestionar miembros | Sí | Sí* | No | No | No |
| Gestionar depósitos | Sí | Sí | Sí | No | No |
| Leer operaciones | Sí | Sí | Sí | Sí | Sí |
| Escribir operaciones | Sí | Sí | Sí | Sí | No |
| Ver reportes | Sí | Sí | Sí | No | Sí |

\* Admin no puede crear, modificar ni eliminar Owners/Admins. Nadie puede eliminar su propia membresía mediante la policy actual y un trigger impide dejar una organización sin Owner activo.

La matriz de UI vive en `src/lib/permissions.ts`; las policies SQL son la autoridad para acceso a datos. Ocultar un botón nunca sustituye la validación de servidor.
