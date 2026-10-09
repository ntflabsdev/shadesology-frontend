import type { Metadata } from "next";
import { CommercialAudiencePage } from "@/components/commercial/CommercialAudiencePage";

export const metadata: Metadata = { title: "Architects & Specifiers | Shadesology" };

export default function ArchitectsSpecifiersPage() {
  return <CommercialAudiencePage
    eyebrow="For design professionals"
    title="Architects and specifiers"
    description="Bring shade into the project early with product guidance, technical coordination and project-specific support."
    audience="Architects and specifiers"
    needs={["Product selection and design coordination", "Technical documents and compliance information", "Project-specific conversations with a specialist"]}
  />;
}
