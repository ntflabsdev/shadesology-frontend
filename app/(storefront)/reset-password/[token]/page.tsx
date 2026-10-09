"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { resetPassword } from "@/lib/api";

interface Props {
  params: Promise<{ token: string }>;
}

export default function ResetPasswordPage({ params }: Props) {
  const router = useRouter();
  const [resolvedToken, setResolvedToken] = React.useState("");

  React.useEffect(() => {
    params.then((p) => setResolvedToken(p.token));
  }, [params]);

  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirm]   = useState("");
  const [errors, setErrors]             = useState<Record<string, string>>({});
  const [serverError, setServerError]   = useState("");
  const [success, setSuccess]           = useState(false);
  const [loading, setLoading]           = useState(false);

  function validate() {
    const errs: Record<string, string> = {};
    if (password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await resetPassword(resolvedToken, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-surface-alt] px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-[--shadow-lg] p-10">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M5 14l6 6L23 8" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[--color-text-primary] mb-2">Password reset!</h1>
            <p className="text-sm text-[--color-text-muted] mb-6">
              Your password has been updated. Redirecting you to login&hellip;
            </p>
            <Button href="/login" fullWidth>Go to login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-surface-alt] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[--color-brand-primary]">Shadesology</Link>
          <h1 className="mt-4 text-2xl font-bold text-[--color-text-primary]">Set a new password</h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">Choose a strong password you haven&apos;t used before.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[--shadow-lg] p-8">
          {serverError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[--color-error]">
              {serverError}{" "}
              <Link href="/forgot-password" className="underline">Request a new link.</Link>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              hint="Minimum 8 characters."
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
              error={errors.confirmPassword}
              required
            />
            <Button type="submit" fullWidth isLoading={loading} size="lg">
              Reset password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
