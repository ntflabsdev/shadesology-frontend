import InstallersPage from "@/app/(storefront)/staff-operations/installers/page";
import WorkspaceTemplate from "./WorkspaceTemplate";

export default function InstallersWorkspace(props: Parameters<typeof WorkspaceTemplate>[0]) {
  return (
    <WorkspaceTemplate {...props}>
      <InstallersPage />
    </WorkspaceTemplate>
  );
}
