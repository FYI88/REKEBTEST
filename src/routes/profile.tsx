import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/screens";
export const Route = createFileRoute("/profile")({head:()=>({meta:[{title:"Mon profil — ENSA Carpool"},{name:"description",content:"Gérez votre profil vérifié ENSA Carpool."},{property:"og:title",content:"Mon profil — ENSA Carpool"},{property:"og:description",content:"Gérez votre profil vérifié ENSA Carpool."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:ProfilePage});
