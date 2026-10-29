import { createFileRoute } from "@tanstack/react-router";
import { HelpPage } from "@/components/information";
export const Route = createFileRoute("/help")({ head: () => ({ meta: [{ title: "Aide et FAQ · Rkeb" }] }), component: HelpPage });
