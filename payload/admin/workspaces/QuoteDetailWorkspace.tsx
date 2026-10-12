import QuoteDetailPage from "@/app/(storefront)/staff-operations/quotes/[id]/page";
import WorkspaceTemplate from "./WorkspaceTemplate";
import type { AdminViewServerProps } from "payload";

export default function QuoteDetailWorkspace(props: AdminViewServerProps) {
  return (
    <WorkspaceTemplate {...props}>
      <QuoteDetailPage />
    </WorkspaceTemplate>
  );
}
