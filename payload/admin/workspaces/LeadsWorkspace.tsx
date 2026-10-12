import LeadsPage from "@/app/(storefront)/staff-operations/leads/page";
import WorkspaceTemplate from "./WorkspaceTemplate";

export default function LeadsWorkspace(props: Parameters<typeof WorkspaceTemplate>[0]) {
  return (
    <WorkspaceTemplate {...props}>
      <LeadsPage />
    </WorkspaceTemplate>
  );
}
