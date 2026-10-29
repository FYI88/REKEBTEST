import { Capacitor } from "@capacitor/core";
import { Download } from "lucide-react";
import { androidRelease } from "@/lib/app-release";

export function AndroidDownload() {
  if (Capacitor.isNativePlatform()) return null;

  return (
    <a
      href={androidRelease.apkUrl}
      className="flex min-h-11 items-center justify-center gap-2 rounded-md border-2 border-current px-3 text-xs font-bold md:hidden"
      aria-label="Télécharger la dernière application Android — APK"
    >
      <Download size={16} aria-hidden="true" />
      <span>APK Android</span>
    </a>
  );
}
