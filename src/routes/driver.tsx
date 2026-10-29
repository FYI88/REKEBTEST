import { createFileRoute } from "@tanstack/react-router";
import { DriverPage } from "@/components/features";
export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Tableau conducteur - ENSA Carpool" },
      { name: "description", content: "Suis tes gains, tes passagers et valide les montées." },
      { property: "og:title", content: "Tableau conducteur - ENSA Carpool" },
      { property: "og:description", content: "Suis tes gains, tes passagers et valide les montées." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DriverPage,
});
