import { useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "@tanstack/react-router";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
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
    };
  }, [router]);

  return null;
}

const subscribe = (cb: () => void) => {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
};

export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  const { demoMode } = useStore();
  const router = useRouter();
  if (online) return null;

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
      {!demoMode && (
        <button type="button" onClick={startDemo} className="underline underline-offset-2">
          Ouvrir le mode démo
        </button>
      )}
    </div>
  );
}
