# Despliegue automático de STAGING

El flujo `deploy-staging.yml` se ejecuta después de cada `push` a `main` y de
forma manual mediante `workflow_dispatch`. Se ejecuta directamente en el runner
self-hosted `angela-staging`, instalado en el servidor de STAGING.

El runner debe poder ejecutar sin interacción el comando:

```bash
sudo /usr/local/sbin/update-angela-staging
```

No se emplean conexiones SSH desde GitHub Actions ni secretos `DEPLOY_*`.
