import { createFileRoute } from "@tanstack/react-router";
import { AdminPage } from "@/components/screens";
export const Route = createFileRoute("/admin")({head:()=>({meta:[{title:"Administration — ENSA Carpool"},{name:"description",content:"Gérez les validations et trajets de la communauté ENSA."},{property:"og:title",content:"Administration — ENSA Carpool"},{property:"og:description",content:"Gérez les validations et trajets de la communauté ENSA."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:AdminPage});
