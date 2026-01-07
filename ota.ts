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

      console.log(`Current: ${current.version}, Remote: ${remoteVersion}`);

      if (isNewerVersion(remoteVersion, current.version)) {
        return {
          version: remoteVersion,
          // Construct the download URL for the GitHub Release asset
          downloadUrl: `https://github.com/JaviDev-01/PayTrack/releases/download/v${remoteVersion}/dist.zip`,
        };
      }
    } catch (error) {
      console.error("Error checking for updates:", error);
    }
    return null;
  },

  async downloadUpdate(versionInfo: VersionInfo) {
    // Notify Capacitor Updater to download the bundle
    return CapacitorUpdater.download({
      version: versionInfo.version,
      url: versionInfo.downloadUrl,
    });
  },

  async installUpdate(versionInfo: VersionInfo) {
    try {
      // Set the update as ready to be used on next app launch
      await CapacitorUpdater.set({ id: versionInfo.version });
      
      // Force app exit to "restart" and apply the new bundle
      await App.exitApp();
      
    } catch (error) {
      // Ignore JS bridge errors during reload/restart
      console.log(
        "Update installation triggered (ignoring bridge error during reload)"
      );
    }
  },
};
