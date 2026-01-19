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
      const current = await App.getInfo();
      // Cache busting with timestamp
      const res = await fetch(`${REPO_URL}?t=${Date.now()}`);
      if (!res.ok) return null;

      const remoteConfig = await res.json();
      const remoteVersion = remoteConfig.version;

      console.log(`[OTA] Current: ${current.version}, Remote: ${remoteVersion}`);

      if (isNewerVersion(remoteVersion, current.version)) {
        return {
          version: remoteVersion,
          downloadUrl: `https://github.com/JaviDev-01/PayTrack/releases/download/v${remoteVersion}/dist.zip`,
        };
      }
    } catch (error) {
      console.error("[OTA] Error checking for updates:", error);
    }
    return null;
  },

  async downloadUpdate(versionInfo: VersionInfo) {
    console.log(`[OTA] Starting download: v${versionInfo.version}`);
    return CapacitorUpdater.download({
      version: versionInfo.version,
      url: versionInfo.downloadUrl,
    });
  },

  async installUpdate(versionInfo: VersionInfo) {
    try {
      console.log(`[OTA] Installing version: ${versionInfo.version}`);
      
      // 1. Set the new version
      await CapacitorUpdater.set({ id: versionInfo.version });
      
      console.log(`[OTA] Version set. Reloading app...`);

      // 2. Reload the app immediately to apply changes
      // This is more reliable than exitApp for OTA
      await CapacitorUpdater.reload();
      
    } catch (error) {
      console.error("[OTA] Installation failed:", error);
      // In case of error, we try a native reload as backup
      window.location.reload();
    }
  },
};
