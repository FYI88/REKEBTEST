import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Github } from "lucide-react";
import { Logo } from "@/components/ui";

export function SiteFooter() {
  return <footer className="border-t-2 border-ink bg-card px-5 py-10">
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div><Link to="/"><Logo /></Link><p className="mt-3 max-w-xs font-display text-xl font-extrabold">Même route, même école, 5 dirhams.</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">Un projet étudiant pensé pour les trajets quotidiens de la communauté ENSA Tanger.</p></div>
        <nav aria-label="À découvrir" className="grid content-start gap-3 text-sm font-bold"><p className="font-mono text-[11px] uppercase text-muted-foreground">À découvrir</p><Link to="/about">À propos et équipe</Link><Link to="/help">Aide et FAQ</Link><Link to="/safety">Sécurité</Link><Link to="/contact">Contact et retours</Link></nav>
        <div className="grid content-start gap-3 text-sm"><p className="font-mono text-[11px] font-bold uppercase text-muted-foreground">École et collaborations</p><a href="https://ensat.ac.ma/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold">ENSA Tanger <ArrowUpRight size={14} /></a><p className="text-xs text-muted-foreground">Cadre académique du projet. Aucune approbation officielle de l’école n’est revendiquée.</p><Link to="/about" hash="partenariats" className="font-bold underline">Pistes de partenariat carburant</Link><p className="text-xs text-muted-foreground">Afriquia : piste envisagée uniquement. Aucun contrat ni réduction confirmés.</p></div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-5 text-xs text-muted-foreground"><p>Développé par <span className="font-bold text-foreground">Chetaine Younes</span> · ENSA GSR1 · Prototype étudiant</p><a href="https://github.com/FYI88/RKEBPROJECT" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-mono font-bold text-foreground"><Github size={16} />Code du projet <ArrowUpRight size={13} /></a></div>
    </div>
  </footer>;
}
