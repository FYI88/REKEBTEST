import { createFileRoute } from "@tanstack/react-router";
import { Auth } from "@/components/screens";
export const Route = createFileRoute("/signup")({head:()=>({meta:[{title:"Rejoindre — ENSA Carpool"},{name:"description",content:"Rejoignez la communauté de covoiturage ENSA Tanger."},{property:"og:title",content:"Rejoindre — ENSA Carpool"},{property:"og:description",content:"Rejoignez la communauté de covoiturage ENSA Tanger."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:()=> <Auth signup />});
