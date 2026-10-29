import { createFileRoute } from "@tanstack/react-router";
import { TripsPage } from "@/components/screens";
export const Route = createFileRoute("/trips")({head:()=>({meta:[{title:"Mes trajets — ENSA Carpool"},{name:"description",content:"Consultez vos trajets ENSA Carpool à venir et passés."},{property:"og:title",content:"Mes trajets — ENSA Carpool"},{property:"og:description",content:"Consultez vos trajets ENSA Carpool à venir et passés."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:TripsPage});
