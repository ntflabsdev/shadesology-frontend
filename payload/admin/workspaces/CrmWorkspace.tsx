import CrmPage from "@/app/(storefront)/staff-operations/crm/page";
import WorkspaceTemplate from "./WorkspaceTemplate";

export default function CrmWorkspace(props: Parameters<typeof WorkspaceTemplate>[0]) {
  return (
    <WorkspaceTemplate {...props}>
      <CrmPage />
    </WorkspaceTemplate>
  );
}
