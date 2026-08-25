# Despliegue automático

El flujo `deploy-production.yml` se ejecuta después de cada `push` a la rama
`main` y ejecuta `update-angela-staging` en el servidor de producción.

Antes del primer despliegue, crea estos secretos en GitHub, en
**Settings → Secrets and variables → Actions**:

| Secreto | Valor |
| --- | --- |
| `DEPLOY_HOST` | IP o nombre de dominio del servidor. |
| `DEPLOY_USER` | Usuario SSH autorizado para ejecutar `update-angela-staging`. |
| `DEPLOY_SSH_KEY` | Clave privada SSH de una clave de despliegue dedicada. |
| `DEPLOY_KNOWN_HOSTS` | Línea de la clave pública del servidor en formato `known_hosts` (por ejemplo, la salida de `ssh-keyscan -H TU_SERVIDOR`). |
| `DEPLOY_PORT` | Puerto SSH; si se omite, se usa `22`. |

La clave pública correspondiente debe estar en `~/.ssh/authorized_keys` del
usuario del servidor. Para limitar su alcance, conviene permitirle solamente el
comando de despliegue.

Una vez configurados los secretos, usa **Actions → Deploy production → Run
workflow** para ejecutar la primera prueba. Después, cada cambio enviado a
`main` actualizará el servidor automáticamente.
