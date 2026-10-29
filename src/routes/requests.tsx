import { createFileRoute } from "@tanstack/react-router";
import { RequestsPage } from "@/components/features";
export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Demandes de trajet - ENSA Carpool" },
      { name: "description", content: "Publie une demande ou propose une place aux passagers de ton quartier." },
      { property: "og:title", content: "Demandes de trajet - ENSA Carpool" },
      { property: "og:description", content: "Publie une demande ou propose une place aux passagers de ton quartier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RequestsPage,
});
