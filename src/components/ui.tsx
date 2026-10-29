import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

type V = "primary" | "ink" | "paper" | "accent" | "danger";
export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V }) {
  return <button {...props} className={cn(
    "press hard-sm inline-flex h-12 items-center justify-center gap-2 rounded-md border-2 border-ink px-5 text-sm font-bold disabled:opacity-40",
    variant === "primary" && "bg-primary text-primary-foreground",
    variant === "ink" && "bg-ink text-ink-foreground",
    variant === "paper" && "bg-card text-foreground",
    variant === "accent" && "bg-accent text-accent-foreground",
    variant === "danger" && "bg-destructive text-primary-foreground",
    className)} />;
}
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string | undefined }) {
  return <label className="grid gap-1.5"><span className="font-mono text-[11px] font-bold uppercase tracking-wider">{label}</span>{children}{hint && <span className="text-xs text-muted-foreground">{hint}</span>}</label>;
}
export const inputClass = "h-12 w-full rounded-md border-2 border-ink bg-card px-3 text-sm focus:bg-primary-soft placeholder:text-muted-foreground";
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-sm border-[1.5px] border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide", className)}>{children}</span>;
}
export function Logo({ invert = false }: { invert?: boolean }) {
  const { theme } = useStore();
  const light = invert || theme === "nuit";
  return <span className="flex items-center gap-2.5">
    <img src={light ? "/rkeb-logo-invert.png" : "/rkeb-logo.png"} alt="Rkeb" className="h-[60px] w-auto" />
    <span className="font-mono text-[10px] font-bold uppercase tracking-[.2em] opacity-70">ENSA</span>
  </span>;
}
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close.current(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-end bg-overlay p-0 sm:place-items-center sm:p-6" onClick={onClose}>
    <div ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className="animate-in slide-in-from-bottom-6 w-full max-w-md rounded-t-xl border-2 border-ink bg-card p-6 hard sm:rounded-xl">
      <div className="mb-4 flex items-start justify-between gap-4"><h3 className="font-display text-2xl font-extrabold">{title}</h3><button onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink"><X size={16} /></button></div>
      {children}
    </div>
  </div>;
}
export function EmptyState({ icon, title, body, children }: { icon?: ReactNode; title: string; body?: string; children?: ReactNode }) {
  return <div className="rounded-lg border-2 border-dashed border-ink p-10 text-center md:col-span-2">
    {icon && <div className="mx-auto mb-2 grid place-items-center">{icon}</div>}
    <p className="font-display text-xl font-extrabold">{title}</p>
    {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
    {children}
  </div>;
}export function Stamp({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("stamp inline-grid place-items-center rounded-full border-2 border-dashed border-ink bg-accent text-center font-display font-extrabold text-accent-foreground", className)}>{children}</span>;
}
