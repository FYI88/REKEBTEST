import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { Logo } from "@/components/ui";

export function SiteFooter() {
  // Temporary comparison control; remove once the footer direction is chosen.
  const [postcard, setPostcard] = useState(false);
  return (
    <footer
      className={`site-footer border-t-2 border-ink${postcard ? " site-footer-postcard" : ""}`}
    >
      <div className="mx-auto max-w-6xl px-5 pt-12 md:pt-16">
        <div
          role="group"
          aria-label="Style du footer — aperçu temporaire"
          className="mb-6 inline-flex items-center gap-1 rounded-full border p-1 text-xs"
        >
          {([false, true] as const).map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={postcard === value}
              onClick={() => setPostcard(value)}
              className="rounded-full px-3 py-2 font-bold"
            >
              {value ? "Carte postale" : "Journal"}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="site-footer-caption font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
              Dernier arrêt : ENSA
            </p>
            <h2 className="site-footer-heading mt-4 max-w-2xl text-4xl leading-[1.08] tracking-tight md:text-6xl">
              Même route.
              <br />
              On se retrouve demain.
            </h2>
          </div>
          <p className="site-footer-caption site-footer-margin-note max-w-52 text-sm">
            Des quartiers de Tanger aux portes du campus. Ensemble, tout simplement.
          </p>
        </div>
      </div>

      <figure
        className={postcard ? "mx-auto max-w-[1440px]" : "mx-auto my-8 max-w-6xl px-5 md:my-10"}
      >
        <img
          src={postcard ? "/dernier-arret-ensa.svg" : "/dernier-arret-ensa-journal.svg"}
          alt=""
          width={postcard ? 1440 : 1200}
          height={postcard ? 480 : 380}
          loading="lazy"
          decoding="async"
          className={postcard ? "block w-full" : "site-footer-sketch block w-full"}
        />
        {!postcard && (
          <figcaption className="site-footer-caption flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs">
            <span className="site-footer-figure-label font-mono">Fig. 1 — Le chemin partagé</span>
            <span className="site-footer-margin-note">
              Tanger → ENSA. Croquis d’un trajet, pas une carte de navigation.
            </span>
          </figcaption>
        )}
      </figure>

      <div className="mx-auto max-w-6xl px-5 pb-8">
        <div className="grid gap-9 pb-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="Rkeb — accueil" className="inline-block">
              <Logo invert={postcard} />
            </Link>
            <p className="mt-3 max-w-xs font-display text-xl font-extrabold">
              Même route, même école, 5 dirhams.
            </p>
            <p className="site-footer-caption mt-2 max-w-sm text-sm">
              Un projet étudiant pensé pour les trajets quotidiens de la communauté ENSA Tanger.
            </p>
          </div>
          <nav aria-label="À découvrir" className="grid content-start gap-3 text-sm font-bold">
            <p className="site-footer-caption mb-1 font-mono text-[11px] uppercase tracking-wider">
              À découvrir
            </p>
            <Link to="/about">À propos et équipe</Link>
            <Link to="/help">Aide et FAQ</Link>
            <Link to="/safety">Sécurité</Link>
            <Link to="/contact">Contact et retours</Link>
          </nav>
          <div className="grid content-start gap-3 text-sm">
            <p className="site-footer-caption mb-1 font-mono text-[11px] font-bold uppercase tracking-wider">
              École et collaborations
            </p>
            <a
              href="https://ensat.ac.ma/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold"
            >
              ENSA Tanger <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <p className="site-footer-caption text-xs">
              Cadre académique du projet. Aucune approbation officielle de l’école n’est
              revendiquée.
            </p>
            <Link to="/about" hash="partenariats" className="font-bold underline">
              Pistes de partenariat carburant
            </Link>
            <p className="site-footer-caption text-xs">
              Afriquia : piste envisagée uniquement. Aucun contrat ni réduction confirmés.
            </p>
          </div>
        </div>
        <div className="site-footer-credit flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs">
          <p className="site-footer-caption">
            Développé par <span className="site-footer-author font-bold">Chetaine Younes</span>
            {" · ENSA GSR1 · Prototype étudiant"}
          </p>
          <a
            href="https://github.com/FYI88/RKEBPROJECT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-mono font-bold"
          >
            <Github size={16} aria-hidden="true" />
            Code du projet <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
