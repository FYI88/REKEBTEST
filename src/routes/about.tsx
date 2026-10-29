import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/information";
export const Route = createFileRoute("/about")({ head: () => ({ meta: [{ title: "À propos et équipe · Rkeb" }] }), component: AboutPage });
