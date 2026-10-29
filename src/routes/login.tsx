import { createFileRoute } from "@tanstack/react-router";
import { Auth } from "@/components/screens";
export const Route = createFileRoute("/login")({head:()=>({meta:[{title:"Connexion — ENSA Carpool"},{name:"description",content:"Connectez-vous à votre espace ENSA Carpool."},{property:"og:title",content:"Connexion — ENSA Carpool"},{property:"og:description",content:"Connectez-vous à votre espace ENSA Carpool."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:()=> <Auth />});
