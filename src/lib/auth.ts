import { useSyncExternalStore } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { me } from "@/lib/demo-data";

export type AuthProfile = {
  id: string;
  email: string;
  fullName: string;
  role: "passager" | "conducteur" | "admin";
  filiere: string | null;
  cne: string | null;
  verified: boolean;
};

type AuthState = { loading: boolean; session: Session | null; profile: AuthProfile | null };

const server: AuthState = { loading: true, session: null, profile: null };
let state: AuthState = server;
const subs = new Set<() => void>();

function set(partial: Partial<AuthState>) {
  state = { ...state, ...partial };
  subs.forEach((l) => l());
}

export async function fetchProfile(id: string): Promise<AuthProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, filiere, cne, verified")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
    filiere: data.filiere,
    cne: data.cne,
    verified: data.verified,
  };
}

async function syncProfile(session: Session | null) {
  if (!session?.user) {
    set({ profile: null });
    return;
  }
  set({ profile: await fetchProfile(session.user.id) });
}

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((_event, session) => {
    set({ session, loading: false });
    void syncProfile(session);
  });
  void supabase.auth.getSession().then(({ data }) => {
    set({ session: data.session, loading: false });
    void syncProfile(data.session);
  });
}

export function useAuth() {
  return useSyncExternalStore(
    (l) => {
      subs.add(l);
      return () => subs.delete(l);
    },
    () => state,
    () => server,
  );
}

export function initialsOf(name: string): string {
  const words = name.split(" ").filter((w) => /^[A-Za-zÀ-Þ]/.test(w) && !w.endsWith("."));
  const first = words[0]?.[0] ?? "E";
  const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export type Identity = {
  name: string;
  initials: string;
  email: string;
  role: string;
  filiere: string;
  cne: string;
  verified: boolean;
  isDemo: boolean;
};

/** Profil affiché : le vrai compte connecté, sinon la persona de démo (Amine). */
export function useIdentity(): Identity {
  const { profile } = useAuth();
  if (profile) {
    return {
      name: profile.fullName,
      initials: initialsOf(profile.fullName),
      email: profile.email,
      role: profile.role,
      filiere: profile.filiere ?? "—",
      cne: profile.cne ?? "—",
      verified: profile.verified,
      isDemo: false,
    };
  }
  return { name: me.name, initials: me.initials, email: me.email, role: "passager", filiere: me.filiere, cne: me.cne, verified: true, isDemo: true };
}

/* ---------- actions ---------- */

export async function sendEmailCode(email: string) {
  const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function verifyEmailCode(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
  return data.user ?? null;
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user ?? null;
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  fullName: string;
  role: "passager" | "conducteur";
  cne?: string;
  filiere?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        role: input.role,
        cne: input.cne ?? "",
        filiere: input.filiere ?? "",
      },
    },
  });
  if (error) throw error;
  return data.session; // null si la confirmation par email est activée
}

export async function signOutUser() {
  await supabase.auth.signOut();
}

export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("token has expired") || m.includes("invalid token")) return "Code expiré ou invalide, redemande-en un.";
  if (m.includes("user already registered")) return "Ce compte existe déjà — connecte-toi.";
  if (m.includes("password should be at least")) return "Mot de passe trop court (6 caractères minimum).";
  if (m.includes("email address") && m.includes("invalid")) return "Adresse email invalide.";
  if (m.includes("email_ensa") || m.includes("violates check constraint")) return "Email refusé : utilise une adresse @etu.uae.ac.ma ou @uae.ac.ma.";
  if (m.includes("rate limit") || m.includes("too many")) return "Trop de tentatives — attends une minute.";
  if (m.includes("email not confirmed")) return "Confirme d'abord ton email (lien reçu), ou utilise le code.";
  return message;
}
