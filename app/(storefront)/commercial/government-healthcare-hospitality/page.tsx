import type { Metadata } from "next";
import { CommercialAudiencePage } from "@/components/commercial/CommercialAudiencePage";

export const metadata: Metadata = { title: "Government, Healthcare & Hospitality | Shadesology" };

export default function PublicSectorHealthcareHospitalityPage() {
  return <CommercialAudiencePage
    eyebrow="For public-facing environments"
    title="Government, healthcare and hospitality"
    description="Explore shade options for busy public environments where comfort, access and long-term performance matter."
    audience="Government, healthcare and hospitality"
    needs={["Solutions scoped to your environment and usage", "Compliance and technical coordination", "Support from project enquiry through installation"]}
  />;
}
