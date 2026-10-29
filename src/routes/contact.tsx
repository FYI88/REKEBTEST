import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/information";
export const Route = createFileRoute("/contact")({ head: () => ({ meta: [{ title: "Contact et retours · Rkeb" }] }), component: ContactPage });
