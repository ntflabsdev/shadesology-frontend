import type { Metadata } from "next";
import { CommercialAudiencePage } from "@/components/commercial/CommercialAudiencePage";

export const metadata: Metadata = { title: "Builders & Property Teams | Shadesology" };

export default function BuildersDevelopersPropertyManagersPage() {
  return <CommercialAudiencePage
    eyebrow="For project delivery teams"
    title="Builders, developers and property managers"
    description="Coordinate durable shade solutions around your project's site conditions, schedule and operational needs."
    audience="Builders, developers and property managers"
    needs={["Early project scoping and product coordination", "Installation planning and qualified partner support", "Documentation for project and property stakeholders"]}
  />;
}
