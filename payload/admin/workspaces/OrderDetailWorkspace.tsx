import OrderDetailPage from "@/app/(storefront)/staff-operations/orders/[id]/page";
import WorkspaceTemplate from "./WorkspaceTemplate";
import type { AdminViewServerProps } from "payload";

export default function OrderDetailWorkspace(props: AdminViewServerProps) {
  return (
    <WorkspaceTemplate {...props}>
      <OrderDetailPage />
    </WorkspaceTemplate>
  );
}
