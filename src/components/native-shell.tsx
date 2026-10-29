import { useEffect, useRef, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { StatusBar } from "@capacitor/status-bar";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { setStore, useStore } from "@/lib/store";

const EXIT_WINDOW_MS = 2000;
const ROOT_PATHS = new Set(["/", "/app"]);

export function NativeBackButton() {
  const router = useRouter();
  const lastPress = useRef(0);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    void StatusBar.hide();
    const appStateListener = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) void StatusBar.hide();
    });
    const listener = App.addListener("backButton", ({ canGoBack }) => {
      const path = router.state.location.pathname;
      if (canGoBack && !ROOT_PATHS.has(path)) {
        window.history.back();
        return;
      }
      const now = Date.now();
      if (now - lastPress.current < EXIT_WINDOW_MS) {
        void App.exitApp();
        return;
      }
      lastPress.current = now;
      toast("Appuie encore sur retour pour quitter", { duration: EXIT_WINDOW_MS });
    });
    return () => {
      void listener.then((l) => l.remove());
      void appStateListener.then((l) => l.remove());
    };
  }, [router]);

  return null;
}

export function OfflineBanner() {
  const [online, setOnline] = useState<boolean | null>(null);
  const { demoMode } = useStore();
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const checkConnection = async () => {
      try {
        const nativeStatus = Capacitor.isNativePlatform() ? await Network.getStatus() : null;
        if (
          (nativeStatus && !nativeStatus.connected) ||
          (Capacitor.isNativePlatform() && nativeStatus?.connectionType === "none") ||
          (!nativeStatus && !navigator.onLine)
        ) {
          if (active) setOnline(false);
          return;
        }
        const response = await fetch(
          "https://www.cloudflare.com/cdn-cgi/trace?rkeb=" + Date.now(),
          {
            method: "GET",
            mode: "cors",
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
          },
        );
        if (active) setOnline(response.ok);
      } catch {
        if (active) setOnline(false);
      }
    };
    const handleConnectivityChange = () => void checkConnection();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") handleConnectivityChange();
    };
    window.addEventListener("online", handleConnectivityChange);
    window.addEventListener("offline", handleConnectivityChange);
    window.addEventListener("focus", handleConnectivityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const poll = window.setInterval(handleConnectivityChange, 20000);
    void checkConnection();
    if (Capacitor.isNativePlatform()) {
      const listener = Network.addListener("networkStatusChange", handleConnectivityChange);
      return () => {
        active = false;
        window.clearInterval(poll);
        window.removeEventListener("online", handleConnectivityChange);
        window.removeEventListener("offline", handleConnectivityChange);
        window.removeEventListener("focus", handleConnectivityChange);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        void listener.then((l) => l.remove());
      };
    }
    return () => {
      active = false;
      window.clearInterval(poll);
      window.removeEventListener("online", handleConnectivityChange);
      window.removeEventListener("offline", handleConnectivityChange);
      window.removeEventListener("focus", handleConnectivityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (online !== false) return null;

  const startDemo = () => {
    setStore(() => ({ demoMode: true }));
    void router.navigate({ to: "/app" });
  };

  return (
    <div
      role="status"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-b-2 border-ink bg-accent px-4 py-2 text-center text-xs font-bold text-accent-foreground"
    >
      <WifiOff size={14} aria-hidden="true" />
      <span>
        Hors ligne · la connexion par compte est indisponible, la démo fonctionne sans réseau.
      </span>
      <button type="button" onClick={startDemo} className="underline underline-offset-2">
        {demoMode ? "Continuer en mode démo" : "Ouvrir le mode démo"}
      </button>
    </div>
  );
}
