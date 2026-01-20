# Sistema de Actualización OTA Profesional (v2.0)

Este documento detalla el funcionamiento del sistema Over-The-Air (OTA) de PayTrack, optimizado para una fiabilidad del 99.9% y una experiencia de usuario sin fricciones.

## Arquitectura y Lógica de Versiones

### 1. Detección Inteligente (`ota.ts`)

A diferencia de las comprobaciones estándar, PayTrack utiliza `CapacitorUpdater.getLatest()`.

- **Por qué**: Las apps Capacitor tienen dos versiones: la del "binario" (App Store/Play Store) y la del "bundle" (OTA). Comparar solo contra el binario hace que la notificación de actualización persista aunque ya se haya descargado la OTA.
- **Solución**: Consultamos el ID del bundle activo. Si coincide con la versión remota, la app sabe que está al día y silencia los avisos.

### 2. Ciclo de Vida de una Actualización

1.  **Check**: Se descarga el `package.json` remoto con un parámetro `?t=` para evitar la caché del navegador.
2.  **Download**: Si la versión remota es superior (comprobación semántica), se descarga el `.zip` en segundo plano.
3.  **Ready**: Se avisa al usuario. Al pulsar "Instalar", la app registra el nuevo bundle.
4.  **Reload**: Se ejecuta `CapacitorUpdater.reload()`. Esto refresca el motor WebView con el nuevo código instantáneamente sin cerrar la aplicación de cara al sistema operativo.

### 3. Sistema de Auto-Reversión (Fail-Safe)

En `App.tsx`, usamos `CapacitorUpdater.notifyAppReady()`.

- Si una actualización está corrupta o hace que la app se cuelgue al inicio, el plugin detectará que no se ha llamado a `notifyAppReady` y **revertirá automáticamente** a la versión anterior estable en el próximo inicio.

## Versiones Internas vs UI

- **Interna (Lógica)**: Se usa la versión semántica completa (ej: `1.6.1`). Es la que manda en las comparaciones de `ota.ts`.
- **Externa (UI)**: Para el usuario, mostramos una versión "Market" más limpia (ej: `v1.6`) en el pie de página de Ajustes, evitando confundir con sub-parches técnicos.

## Consejos de Mantenimiento

- **Versión en package.json**: Siempre que subas una nueva versión a la rama `main`, asegúrate de incrementar el campo `version`.
- **Releases de GitHub**:
  - Crea un nuevo Release con el tag `v1.6.4` (coincidiendo con package.json).
  - **IMPORTANTE: El archivo `dist.zip`**:
    1. Entra en tu carpeta `dist/` (o `build/`).
    2. Selecciona **todos los archivos** dentro (index.html, assets, etc.).
    3. Comprímelos en `dist.zip`.
    4. **NO** comprimas la carpeta `dist` desde fuera. El `index.html` debe estar en la raíz del zip.
