"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { QuotesPanel } from "./QuotesPanel";
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

type Tab = "profile" | "security" | "orders" | "quotes";

export function AccountDashboard({ user: initialUser }: Props) {
  const router    = useRouter();
  const { toast } = useToast();

  const [user, setUser]   = useState(initialUser);
  const [tab, setTab]     = useState<Tab>("profile");
  const [loading, setLoading] = useState(false);

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
    { id: "profile",  label: "Profile" },
    { id: "security", label: "Security" },
    { id: "orders",   label: "Orders" },
    { id: "quotes",   label: "Quotes" },
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
            <div className="text-center py-10 text-[--color-text-muted]">
              <svg className="mx-auto mb-3 opacity-30" width="48" height="48" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <rect x="8" y="12" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2" />
                <path d="M16 12V9a8 8 0 0116 0v3" stroke="currentColor" strokeWidth="2" />
              </svg>
              <p className="font-medium">No orders yet</p>
              <p className="text-sm mt-1">
                Orders will appear here once you&apos;ve completed a purchase.
              </p>
              <Button href="/products" variant="outline" size="sm" className="mt-4">
                Browse products
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
    </div>
  );
}
