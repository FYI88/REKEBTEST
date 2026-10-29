import { createFileRoute } from "@tanstack/react-router";
import { ChatPage } from "@/components/screens";
export const Route = createFileRoute("/chat/$tripId")({head:()=>({meta:[{title:"Discussion du trajet — ENSA Carpool"},{name:"description",content:"Échangez en toute sécurité avec votre conducteur."},{property:"og:title",content:"Discussion du trajet — ENSA Carpool"},{property:"og:description",content:"Échangez en toute sécurité avec votre conducteur."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:ChatPage});
