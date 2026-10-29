import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey);

if (!hasSupabaseEnv) {
  console.warn("Supabase env manquantes : mode démo uniquement (voir .env.example).");
}

export const supabase = createClient(supabaseUrl || "https://demo.invalid", supabaseKey || "demo-publishable-key");
