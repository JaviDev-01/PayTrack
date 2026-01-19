# Sistema OTA Profesional para Capacitor

Este documento detalla la lógica implementada en **PayTrack** para lograr actualizaciones Over-The-Air (OTA) con un **99.9% de fiabilidad**, utilizando el plugin `@capgo/capacitor-updater`.

## 1. Arquitectura de Fiabilidad (Rollback Automático)

La mayor causa de fallo en sistemas OTA es una actualización que se descarga bien pero rompe la app al arrancar (ej: error JS crítico).
Para evitar esto, hemos implementado el mecanismo de **Confirmación de Inicio**:

- **Lógica**: Al arrancar, la app tiene un tiempo límite (30s por defecto) para llamar a `CapacitorUpdater.notifyAppReady()`.
- **Protección**: Si la app falla o no llama a esa función a tiempo, el sistema asume que la actualización es defectuosa y **revierte automáticamente** a la versión anterior funcional.

```typescript
// En App.tsx (al inicio del componente)
useEffect(() => {
  CapacitorUpdater.notifyAppReady();
}, []);
```

## 2. Proceso de Actualización paso a paso

### Paso A: Comprobación (Check)

Se consulta un archivo JSON (habitualmente el `package.json` en main o un servidor dedicado) comparando la versión local con la remota.

### Paso B: Descarga (Download)

Se descarga el `.zip` del bundle web en segundo plano. Nunca bloqueamos al usuario aquí.

### Paso C: Instalación y Reinicio (Install & Reload)

Usamos `CapacitorUpdater.reload()` en lugar de simplemente cerrar la app. Esto asegura que el nuevo código se cargue de inmediato.

---

## 3. Guía de Implementación para nuevos proyectos

### Requisitos previos

```bash
npm install @capgo/capacitor-updater @capacitor/app @capacitor/filesystem
npx cap sync
```

### Tutorial de Configuración

#### 1. Crear el servicio `ota.ts`

Define una interfaz para la versión y los métodos `checkForUpdate`, `downloadUpdate` e `installUpdate`. Asegúrate de usar `reload()` para aplicar los cambios.

#### 2. Inicializar en `App.tsx`

Es obligatorio llamar a `notifyAppReady` en el primer `useEffect`. Esto activa el seguro de vida de tu aplicación.

#### 3. Automatización (GitHub Actions)

Para que el sistema sea profesional, usa una Action que:

1. Compile tu proyecto (`npm run build`).
2. Comprima la carpeta `dist` o `build` en un `dist.zip`.
3. Cree una release en GitHub con el tag `vX.X.X`.

#### 4. Ejemplo de comparación semántica

No uses strings simples, separa por puntos (`1.2.0`) y compara cada bloque para evitar que una versión `1.10.0` se considere menor que `1.2.0`.

---

## 4. Consejos Pro

- **Busting Cache**: Añade un timestamp a la URL del fetch para evitar que los navegadores/proxies sirvan un `package.json` antiguo.
- **Micro-Delays**: Al dar a "Instalar", añade un pequeño retraso de 500ms-1s. Esto permite que la UI muestre un mensaje de "Instalando..." antes de que la app se refresque, dando una sensación de proceso controlado al usuario.
