# Notas para agentes — Monitor Electoral Territorial ERM 2026

Este archivo resume el trabajo reciente sobre el mapa político-electoral y la
navegación territorial, para que cualquier agente (Claude, Codex, etc.) que
retome el trabajo tenga contexto sin repetir el diagnóstico.

## Archivo principal

Toda la lógica de mapa + navegación territorial + consulta de listas vive en
un único componente grande: [`app/page.tsx`](app/page.tsx) (~2300 líneas).
No hay componentes separados para el mapa, el panel lateral o las listas —
todo es un `Home()` con muchos `useState`/`useEffect`.

## Historial de bugs resueltos (más reciente primero)

- `315b6eb` — Migas de pan (`Perú › Depto › Provincia › Distrito`) ahora son
  clicables: cada nivel (excepto el actual) regresa a esa jurisdicción sin
  perder el resto del estado. Ver bloque `.crumbs` en `page.tsx` (línea ~1219)
  y el CSS `.crumbs button` en [`app/globals.css`](app/globals.css).
- `1bf7257` — Fix principal de sincronización mapa ↔ panel lateral:
  - Elegir un departamento (mapa o `<select>`) resetea `level` a `"4"`
    (Regional) y limpia `prov`/`dist`, en vez de dejar el campo "Provincia"
    vacío exigiendo selección manual mientras `level` seguía en 5/6 por un
    estado previo (deep link, búsqueda de texto, etc.).
  - Se generalizó el `useEffect` que dispara `search()`: antes solo lo hacía
    si venía de un "deep link" (`dashboardTargetRef`) y excluía el nivel "4".
    Ahora se dispara automáticamente en cuanto `canSearch` es `true`, sin
    importar el origen (clic de mapa, dropdown, búsqueda de texto).
  - Se corrigió una llave de cierre sobrante en el `render` del mapa
    (`}}; }` → `}`) que rompía el build por completo (parse error). Este bug
    de sintaxis ya estaba en `HEAD` antes de esta sesión.
  - `suppressAutoSearchRef` evita que la nueva auto-búsqueda le gane la
    carrera a `goToCandidateList` (ir a la ficha de un candidato buscado) y
    le borre la lista recién abierta.
- Commits anteriores (`e251e9c`, `20ec7f9`, `deb188a`, `5e0e1af`, `982293f`,
  `c475860`) son parte de la misma serie de fixes incrementales sobre el
  mapa SVG (geometrías, ReferenceErrors, sincronización dropdown↔nivel).
  Si algo del mapa vuelve a romperse, revisar esa cadena de commits primero.

## Entorno de desarrollo local (Windows) — limitación conocida

`npm run dev` (Vite + `@cloudflare/vite-plugin` + `vinext`/RSC) **no arranca
de forma confiable en Windows nativo** en este entorno: falla con

```
error when starting dev server:
Error: Calling `require` for "react-dom" in an environment that doesn't
expose the `require` function.
```

Esto ocurre incluso con `node_modules` reinstalado desde cero con `npm ci`
(lockfile exacto) — no es un problema de dependencias mal resueltas, sino de
compatibilidad entre esa combinación de versiones y el runtime de Workers
(`workerd`) en Windows. Ver el comentario en
[`vite.config.ts`](vite.config.ts) (líneas ~47-49) que ya reconoce un
problema similar de doble-bundling de React visto en el
**"self-hosted STAGING server"**.

**Cómo verificar cambios sin depender de `npm run dev` local:** hacer commit
y `git push origin main` — el workflow
[`.github/workflows/deploy-staging.yml`](.github/workflows/deploy-staging.yml)
se dispara con cada push a `main` (o manualmente via `workflow_dispatch`) y
corre en un runner autohospedado (`angela-staging`) donde sí funciona.
Ese es el flujo de verificación real usado en esta sesión.

Notas menores:
- PowerShell con política de ejecución restringida bloquea `npm.ps1` /
  `npx.ps1`. Usar `npm.cmd` / `npx.cmd`, o directamente
  `.\node_modules\.bin\vite.cmd`.
- El warning `Unable to fetch the 'Request.cf' object!` es inofensivo (cae a
  un placeholder); no es la causa del crash.

## Archivos sueltos sin trackear en la raíz del repo

Hay varios scripts `.cjs` sueltos en la raíz (`fix_dropdowns.cjs`,
`fix_map_click.cjs`, `fix_page.cjs`, `test_*.cjs`, etc.) y una carpeta
`tmp_bin/` que **no están en git** (aparecen como `??` en `git status`).
Son residuos de sesiones anteriores de debugging/parcheo automático del
mapa — no son parte del código fuente activo ni se deben tomar como
referencia. No borrarlos salvo que el usuario lo pida explícitamente.

## Pendiente / posibles próximos pasos

- Confirmar con el usuario si `app/territorial-signals.ts` y
  `app/vote-intention.ts` (con cambios locales sin commitear al momento de
  escribir esto) deben incluirse en un commit futuro — son trabajo en
  progreso de otra sesión, no tocado por los fixes de arriba.
- Si se retoma el mapa: el flujo de clic ya soportado es
  Perú → clic departamento → clic provincia → clic distrito, con
  auto-consulta en cada nivel válido. Cualquier cambio debe preservar que
  `canSearch` se vuelva `true` de forma consistente con `level`/`prov`/`dist`.
