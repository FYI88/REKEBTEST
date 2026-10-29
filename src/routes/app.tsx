import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/prototype";
export const Route = createFileRoute("/app")({head:()=>({meta:[{title:"Trouver un trajet — ENSA Carpool"},{name:"description",content:"Trouvez un trajet vérifié vers l’ENSA Tanger à prix fixe."},{property:"og:title",content:"Trouver un trajet — ENSA Carpool"},{property:"og:description",content:"Trouvez un trajet vérifié vers l’ENSA Tanger à prix fixe."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:Dashboard});
