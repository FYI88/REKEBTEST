import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useStore } from "../lib/store";
import { Toaster } from "../components/ui/sonner";
import { NativeBackButton, OfflineBanner } from "../components/native-shell";

const homeLink = "press hard-sm inline-flex h-12 items-center justify-center rounded-md border-2 border-ink bg-primary px-5 text-sm font-bold text-primary-foreground";
const ghostLink = "press hard-sm inline-flex h-12 items-center justify-center rounded-md border-2 border-ink bg-card px-5 text-sm font-bold";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Erreur 404</p>
        <h1 className="mt-2 font-display text-8xl font-extrabold tracking-tight">4<span className="text-primary">0</span>4</h1>
        <h2 className="mt-4 font-display text-2xl font-extrabold">Ce trajet n’existe pas.</h2>
        <p className="mt-2 text-sm text-muted-foreground">La page est introuvable ou a changé d’adresse. Retourne à l’accueil ou cherche un trajet vers l’ENSA.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className={homeLink}>Accueil</Link>
          <Link to="/app" className={ghostLink}>Voir les trajets</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl font-extrabold">Cette page n’a pas pu se charger.</h1>
        <p className="mt-2 text-sm text-muted-foreground">Un problème est survenu de notre côté. Réessaie, ou retourne à l’accueil.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className={homeLink}
          >
            Réessayer
          </button>
          <a href="/" className={ghostLink}>
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rkeb · Covoiturage étudiant ENSA Tanger" },
      { name: "description", content: "Covoiturage vérifié pour la communauté ENSA Tanger : même route, même école, 5 dirhams." },
      { name: "theme-color", content: "#2a8f93" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", type: "image/png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: 'try{var t=JSON.parse(localStorage.getItem("rkeb-demo-state-v1")||"{}").theme;if(t==="ensa"||t==="nuit")document.documentElement.classList.add("theme-"+t)}catch(e){}' }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function ThemeApplier() {
  const { theme } = useStore();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-ensa", theme === "ensa");
    root.classList.toggle("theme-nuit", theme === "nuit");
  }, [theme]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplier />
      <NativeBackButton />
      <OfflineBanner />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" toastOptions={{ classNames: { toast: "!rounded-lg !border-2 !border-ink !bg-card !font-bold !text-foreground" } }} />
    </QueryClientProvider>
  );
}
