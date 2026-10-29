import { createFileRoute } from "@tanstack/react-router";
import { TrackPage } from "@/components/features";
export const Route = createFileRoute("/track/$tripId")({
  head: () => ({
    meta: [
      { title: "Suivi du trajet - ENSA Carpool" },
      { name: "description", content: "Suis ton conducteur en direct et partage ton trajet." },
      { property: "og:title", content: "Suivi du trajet - ENSA Carpool" },
      { property: "og:description", content: "Suis ton conducteur en direct et partage ton trajet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});
