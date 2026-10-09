import type { Access, PayloadRequest, Where } from "payload";

export type StaffRole = "admin" | "sales" | "support" | "content";
export type StaffUser = NonNullable<PayloadRequest["user"]> & { role: StaffRole };

export function isStaff(user: PayloadRequest["user"]): user is StaffUser {
  return Boolean(
    user &&
    "role" in user &&
    ["admin", "sales", "support", "content"].includes(String(user.role)),
  );
}

export const canUseAdmin = ({ req }: { req: PayloadRequest }) => isStaff(req.user);

export const isAdmin = ({ req }: { req: PayloadRequest }) =>
  isStaff(req.user) && req.user.role === "admin";

export function staffRoles(...roles: StaffRole[]): Access {
  return ({ req }) => isStaff(req.user) && roles.includes(req.user.role);
}

export const publishedOrStaff: Access = ({ req }) => {
  if (isStaff(req.user)) return true;
  return { _status: { equals: "published" } } satisfies Where;
};
