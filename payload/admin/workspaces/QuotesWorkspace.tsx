import QuotesPage from "@/app/(storefront)/staff-operations/quotes/page";
import WorkspaceTemplate from "./WorkspaceTemplate";

export default function QuotesWorkspace(props: Parameters<typeof WorkspaceTemplate>[0]) {
  return (
    <WorkspaceTemplate {...props}>
      <QuotesPage />
    </WorkspaceTemplate>
  );
}
