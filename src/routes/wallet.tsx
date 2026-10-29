import { createFileRoute } from "@tanstack/react-router";
import { WalletPage } from "@/components/screens";
export const Route = createFileRoute("/wallet")({head:()=>({meta:[{title:"Portefeuille — ENSA Carpool"},{name:"description",content:"Suivez votre solde et vos trajets à 5 DH."},{property:"og:title",content:"Portefeuille — ENSA Carpool"},{property:"og:description",content:"Suivez votre solde et vos trajets à 5 DH."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:WalletPage});
