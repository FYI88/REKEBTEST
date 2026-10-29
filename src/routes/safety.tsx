import { createFileRoute } from "@tanstack/react-router";
import { SafetyPage } from "@/components/information";
export const Route = createFileRoute("/safety")({ head: () => ({ meta: [{ title: "Sécurité · Rkeb" }] }), component: SafetyPage });
