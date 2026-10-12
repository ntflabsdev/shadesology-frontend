import OrdersPage from "@/app/(storefront)/staff-operations/orders/page";
import WorkspaceTemplate from "./WorkspaceTemplate";

export default function OrdersWorkspace(props: Parameters<typeof WorkspaceTemplate>[0]) {
  return (
    <WorkspaceTemplate {...props}>
      <OrdersPage />
    </WorkspaceTemplate>
  );
}
