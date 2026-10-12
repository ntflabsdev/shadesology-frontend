"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { QuotesPanel } from "./QuotesPanel";
import { WishlistPanel } from "@/components/storefront/WishlistPanel";
import { ReferralRewards } from "@/components/storefront/ReferralRewards";
import { AffiliateLoyaltyPanel } from "@/components/storefront/AffiliateLoyaltyPanel";
import {
  type AuthUser,
  logoutUser,
  updateProfile,
  changePassword,
} from "@/lib/api";

interface Props {
  user: AuthUser;
}

const ROLE_LABELS: Record<string, string> = {
  customer:  "Customer",
  installer: "Installer",
  specifier: "Specifier",
  dealer:    "Dealer",
  staff:     "Staff",
};

type Tab = "overview" | "profile" | "security" | "orders" | "quotes" | "designs" | "preferences" | "loyalty";

const savedDesigns = [
  { id: "d-1042", name: "Sunset patio awning", status: "Ready for review", updatedAt: "2 days ago", shareStatus: "Private" },
  { id: "d-1108", name: "Backyard pergola concept", status: "Quoted", updatedAt: "1 week ago", shareStatus: "Shared with installer" },
  { id: "d-1122", name: "Pool screen layout", status: "Installed", updatedAt: "2 months ago", shareStatus: "Archived" },
];

const supportTickets = [
  { id: "SR-4012", topic: "Delivery date question", status: "Open" },
  { id: "SR-3947", topic: "Installation guidance", status: "Resolved" },
  { id: "SR-3896", topic: "Warranty claim upload", status: "Waiting on documents" },
];

const portalDocuments = [
  { label: "Installation manual", type: "Manual" },
  { label: "Warranty certificate", type: "Warranty" },
  { label: "Order confirmation", type: "Order" },
];

export function AccountDashboard({ user: initialUser }: Props) {
  const router    = useRouter();
  const { toast } = useToast();

  const [user, setUser]   = useState(initialUser);
  const [tab, setTab]     = useState<Tab>("overview");
  const [loading, setLoading] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailUpdates: true,
    smsAlerts: false,
    maintenanceReminders: true,
    marketingOffers: false,
  });

  // ── Profile form ────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState({
    firstName: user.firstName,
    lastName:  user.lastName,
    phone:     "",
  });

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateProfile(profile);
      setUser(updated);
      toast({ title: "Profile updated", variant: "success" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Update failed", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  // ── Change password form ─────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwErrors({});
    const errs: Record<string, string> = {};
    if (!pwForm.currentPassword) errs.currentPassword = "Required.";
    if (pwForm.newPassword.length < 8) errs.newPassword = "Minimum 8 characters.";
    if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }

    setLoading(true);
    try {
      await changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast({ title: "Password updated. Other sessions have been signed out.", variant: "success" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to change password", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────────────
  async function handleLogout() {
    await logoutUser();
    router.push("/");
    router.refresh();
  }

  // ── Tabs ─────────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "profile",  label: "Profile" },
    { id: "security", label: "Security" },
    { id: "orders",   label: "Orders" },
    { id: "quotes",   label: "Quotes" },
    { id: "designs",  label: "Saved designs" },
    { id: "preferences", label: "Preferences" },
    { id: "loyalty", label: "Loyalty & affiliate" },
  ];

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[--color-text-primary]">
            Welcome back, {user.firstName}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-[--color-text-muted]">{user.email}</span>
            <Badge variant={user.isEmailVerified ? "success" : "warning"}>
              {user.isEmailVerified ? "Verified" : "Unverified"}
            </Badge>
            <Badge variant="default">{ROLE_LABELS[user.role] ?? user.role}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "installer" && <Button href="/installer/portal" size="sm">Installer portal</Button>}
          <Button variant="ghost" onClick={handleLogout} size="sm">Sign out</Button>
        </div>
      </div>

      {/* Tab nav */}
      <div
        role="tablist"
        aria-label="Account sections"
        className="flex gap-1 border-b border-[--color-border] mb-8 overflow-x-auto"
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            id={`tab-${t.id}`}
            aria-controls={`panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={[
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]",
              tab === t.id
                ? "border-b-2 border-[--color-brand-primary] text-[--color-brand-primary]"
                : "text-[--color-text-muted] hover:text-[--color-text-primary]",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview tab ─────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-overview"
        aria-labelledby="tab-overview"
        hidden={tab !== "overview"}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Open orders", value: "2", meta: "1 in production" },
            { label: "Warranty coverage", value: "3 items", meta: "2 expiring this year" },
            { label: "Saved designs", value: "3", meta: "1 shared with installer" },
            { label: "Open tickets", value: "1", meta: "Response in 1–2 days" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardBody>
                <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-[--color-text-primary]">{stat.value}</p>
                <p className="mt-1 text-sm text-[--color-text-muted]">{stat.meta}</p>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-[--color-text-primary]">Recent activity</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {[
                  { title: "Order #44018 shipped", detail: "Your patio awning is en route to your delivery address.", status: "In transit" },
                  { title: "Pergola quote approved", detail: "Your quote is ready for final confirmation before production starts.", status: "Awaiting approval" },
                  { title: "Annual maintenance reminder", detail: "A seasonal inspection is due for your pool privacy screen.", status: "Scheduled" },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-[--color-border] bg-[--color-neutral-50] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-[--color-text-primary]">{item.title}</h3>
                      <Badge variant="default">{item.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[--color-text-muted]">{item.detail}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[--color-text-primary]">Documents & guides</h2>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {portalDocuments.map((document) => (
                    <li key={document.label} className="flex items-center justify-between rounded-xl border border-[--color-border] bg-white p-3">
                      <div>
                        <p className="font-medium text-[--color-text-primary]">{document.label}</p>
                        <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">{document.type}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm">View</Button>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-semibold text-[--color-text-primary]">Support tickets</h2>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {supportTickets.map((ticket) => (
                    <li key={ticket.id} className="flex items-center justify-between gap-3 rounded-xl border border-[--color-border] bg-white p-3">
                      <div>
                        <p className="font-medium text-[--color-text-primary]">{ticket.topic}</p>
                        <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">{ticket.id}</p>
                      </div>
                      <Badge variant={ticket.status === "Open" ? "warning" : "default"}>{ticket.status}</Badge>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <WishlistPanel />
          <ReferralRewards />
        </div>

        <div className="mt-6 rounded-2xl border border-[--color-border] bg-[--color-brand-primary]/5 p-5">
          <p className="text-sm font-semibold text-[--color-brand-primary] uppercase tracking-[0.08em]">Customer isolation</p>
          <p className="mt-2 text-sm text-[--color-text-muted]">
            This portal is scoped to your account only. Orders, documents and design projects shown here are for the active customer and are not shared with other users or households.
          </p>
        </div>
      </div>

      {/* ── Profile tab ─────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-profile"
        aria-labelledby="tab-profile"
        hidden={tab !== "profile"}
      >
        <Card className="max-w-lg">
          <CardHeader>
            <h2 className="font-semibold text-[--color-text-primary]">Personal information</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First name"
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
                <Input
                  label="Last name"
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
              <Input label="Email address" type="email" value={user.email} disabled hint="Contact support to change your email." />
              <Input
                label="Phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
              <Button type="submit" isLoading={loading}>Save changes</Button>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* ── Security tab ─────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-security"
        aria-labelledby="tab-security"
        hidden={tab !== "security"}
      >
        <Card className="max-w-lg">
          <CardHeader>
            <h2 className="font-semibold text-[--color-text-primary]">Change password</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={savePassword} className="space-y-4">
              <Input
                label="Current password"
                type="password"
                autoComplete="current-password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                error={pwErrors.currentPassword}
                required
              />
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                error={pwErrors.newPassword}
                hint="Minimum 8 characters."
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                error={pwErrors.confirmPassword}
                required
              />
              <Button type="submit" isLoading={loading}>Update password</Button>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* ── Orders tab ───────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-orders"
        aria-labelledby="tab-orders"
        hidden={tab !== "orders"}
      >
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div className="rounded-xl border border-[--color-border] bg-[--color-neutral-50] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Current order</p>
                    <p className="mt-1 text-xl font-bold text-[--color-text-primary]">#44018 · Patio awning</p>
                  </div>
                  <Badge variant="accent">In production</Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[--color-border] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Status</p>
                  <p className="mt-2 font-semibold text-[--color-text-primary]">Fabric cut and frame assembly</p>
                  <p className="mt-1 text-sm text-[--color-text-muted]">Estimated dispatch: 7–10 business days</p>
                </div>
                <div className="rounded-xl border border-[--color-border] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Delivery</p>
                  <p className="mt-2 font-semibold text-[--color-text-primary]">Home delivery</p>
                  <p className="mt-1 text-sm text-[--color-text-muted]">Shipping to 28 Harbor Lane, Austin, TX 78704</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button href="/account/orders" variant="outline" size="sm">
                View full order history
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* ── Quotes tab ───────────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-quotes"
        aria-labelledby="tab-quotes"
        hidden={tab !== "quotes"}
      >
        {tab === "quotes" && <QuotesPanel />}
      </div>

      {/* ── Saved designs tab ─────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-designs"
        aria-labelledby="tab-designs"
        hidden={tab !== "designs"}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {savedDesigns.map((design) => (
            <Card key={design.id}>
              <CardBody>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[--color-text-primary]">{design.name}</p>
                  <Badge variant="default">{design.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-[--color-text-muted]">Last updated {design.updatedAt}</p>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">
                  <span>{design.id}</span>
                  <span>{design.shareStatus}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button type="button" variant="outline" size="sm">Open</Button>
                  <Button type="button" variant="ghost" size="sm">Share</Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Loyalty & affiliate tab ─────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-loyalty"
        aria-labelledby="tab-loyalty"
        hidden={tab !== "loyalty"}
      >
        <AffiliateLoyaltyPanel />
      </div>

      {/* ── Preferences tab ───────────────────────────────────────────────── */}
      <div
        role="tabpanel"
        id="panel-preferences"
        aria-labelledby="tab-preferences"
        hidden={tab !== "preferences"}
      >
        <Card className="max-w-2xl">
          <CardHeader>
            <h2 className="font-semibold text-[--color-text-primary]">Notification preferences</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {[
                { key: "emailUpdates", label: "Order and account emails" },
                { key: "smsAlerts", label: "SMS delivery and dispatch alerts" },
                { key: "maintenanceReminders", label: "Maintenance reminder emails" },
                { key: "marketingOffers", label: "Promotional offers and product updates" },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-4 py-3 text-sm">
                  <span className="font-medium text-[--color-text-primary]">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                    onChange={(event) =>
                      setNotificationPrefs((current) => ({
                        ...current,
                        [item.key]: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[--color-brand-primary]"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="secondary">Save preferences</Button>
              <Button type="button" variant="outline">Export my data</Button>
              <Button type="button" variant="ghost">Delete account</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
