import { CapacitorUpdater } from "@capgo/capacitor-updater";
import { App } from "@capacitor/app";

const REPO_URL =
  "https://raw.githubusercontent.com/JaviDev-01/PayTrack/main/package.json";

interface VersionInfo {
  version: string;
  downloadUrl: string;
}

// Helper to compare semantic versions: returns true if vA > vB
function isNewerVersion(vA: string, vB: string): boolean {
  const partsA = vA.split(".").map(Number);
  const partsB = vB.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const a = partsA[i] || 0;
    const b = partsB[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

export const OTA = {
  async checkForUpdate(): Promise<VersionInfo | null> {
    try {
      // 1. Get the CURRENT active version (the one currently running)
      // This is more accurate than App.getInfo() for OTA-updated apps
      const latest = await CapacitorUpdater.getLatest();
      const currentVersion = latest.version || (await App.getInfo()).version;
      
      console.log(`[OTA] Detectando versión activa: ${currentVersion}`);

      // 2. Fetch remote version
      // Cache busting with timestamp
      const res = await fetch(`${REPO_URL}?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} fetching remote config`);
      }

      const remoteConfig = await res.json();
      const remoteVersion = remoteConfig.version;

      console.log(`[OTA] Remota: ${remoteVersion}`);

      if (isNewerVersion(remoteVersion, currentVersion)) {
        return {
          version: remoteVersion,
          downloadUrl: `https://github.com/JaviDev-01/PayTrack/releases/download/v${remoteVersion}/dist.zip`,
        };
      } else {
        console.log(`[OTA] Aplicación ya actualizada a la versión más reciente.`);
      }
    } catch (error) {
      console.error("[OTA] Error checking for updates:", error);
    }
    return null;
  },

  async downloadUpdate(versionInfo: VersionInfo) {
    console.log(`[OTA] Iniciando descarga: v${versionInfo.version}`);
    return CapacitorUpdater.download({
      version: versionInfo.version,
      url: versionInfo.downloadUrl,
    });
  },

  async installUpdate(versionInfo: VersionInfo) {
    if (!versionInfo?.version) {
      console.error("[OTA] No version info provided to installUpdate");
      return;
    }

    try {
      // 4. Log versions for debugging
      const all = await CapacitorUpdater.list();
      console.log("[OTA] Versiones instaladas:", all);

      console.log(`[OTA] Instalando versión: ${versionInfo.version}`);
      
      // Creating a race promise: if plugin takes too long, we force reload
      const installPromise = async () => {
        // 2. Safer: Ensure download exists before setting
        await CapacitorUpdater.download({
          version: versionInfo.version,
          url: versionInfo.downloadUrl,
        });

        await CapacitorUpdater.set({ id: versionInfo.version });
        console.log(`[OTA] Versión establecida. Reiniciando app...`);
        await CapacitorUpdater.reload();
      };

      const timeoutPromise = new Promise((_, reject) => {
         // 1. Increased timeout to 8000ms as requested
         setTimeout(() => reject(new Error("Timeout waiting for updates")), 8000);
      });

      await Promise.race([installPromise(), timeoutPromise]);
      
    } catch (error) {
      console.error("[OTA] Fallo en la instalación o Timeout:", error);
      // Fallback a recarga de ventana si falla el plugin o tarda demasiado
      window.location.reload();
    }
  },

  async getCurrentVersion(): Promise<string> {
    try {
      const latest = await CapacitorUpdater.getLatest();
      return latest.version || (await App.getInfo()).version;
    } catch (e) {
      console.warn("[OTA] Error fetching version, fallback to generic", e);
      return (await App.getInfo()).version;
    }
  },
};
