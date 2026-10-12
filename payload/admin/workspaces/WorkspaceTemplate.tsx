import type { ReactNode } from "react";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { redirect } from "next/navigation";
import type { AdminViewServerProps } from "payload";

type WorkspaceTemplateProps = AdminViewServerProps & { children: ReactNode };

export default function WorkspaceTemplate({ children, ...props }: WorkspaceTemplateProps) {
  if (!props.initPageResult.req.user) {
    redirect("/admin/login");
  }

  const visibleEntities = props.initPageResult.visibleEntities;
  if (!visibleEntities) {
    throw new Error("Payload workspace is missing its visible entities.");
  }

  return (
    <DefaultTemplate {...props} visibleEntities={visibleEntities}>
      {children}
    </DefaultTemplate>
  );
}
