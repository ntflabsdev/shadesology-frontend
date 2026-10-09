import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import { AccountDashboard } from "./AccountDashboard";

export const metadata = {
  title: "My Account",
  robots: { index: false },
};

export default async function AccountPage() {
  const user = await getMe();
  if (!user) redirect("/login");

  return <AccountDashboard user={user} />;
}
