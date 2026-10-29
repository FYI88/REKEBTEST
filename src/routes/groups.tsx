import { createFileRoute } from "@tanstack/react-router";
import { GroupsPage } from "@/components/features";
export const Route = createFileRoute("/groups")({
  head: () => ({
    meta: [
      { title: "Groupes et cotisation essence - ENSA Carpool" },
      { name: "description", content: "Rejoins un groupe de covoiturage et partage le plein de la semaine." },
      { property: "og:title", content: "Groupes et cotisation essence - ENSA Carpool" },
      { property: "og:description", content: "Rejoins un groupe de covoiturage et partage le plein de la semaine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GroupsPage,
});
