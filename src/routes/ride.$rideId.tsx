import { createFileRoute } from "@tanstack/react-router";
import { RideDetail } from "@/components/screens";
export const Route = createFileRoute("/ride/$rideId")({head:()=>({meta:[{title:"Détail du trajet — ENSA Carpool"},{name:"description",content:"Consultez le conducteur, le parcours et réservez votre place."},{property:"og:title",content:"Détail du trajet — ENSA Carpool"},{property:"og:description",content:"Consultez le conducteur, le parcours et réservez votre place."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:RideRoute});
function RideRoute(){ const { rideId } = Route.useParams(); return <RideDetail rideId={rideId}/>; }
