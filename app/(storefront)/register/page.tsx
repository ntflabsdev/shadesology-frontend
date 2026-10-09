"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim())  errs.lastName  = "Last name is required.";
    if (!form.email.trim())     errs.email     = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    if (!acceptTerms) errs.terms = "You must accept the terms to create an account.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await registerUser({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        password:  form.password,
        phone:     form.phone.trim() || undefined,
      });
      setSuccess(true);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
            <h1 className="text-xl font-bold text-[--color-text-primary] mb-2">Check your inbox!</h1>
            <p className="text-sm text-[--color-text-muted] mb-6">
              We sent a verification link to <strong>{form.email}</strong>. Click it to activate your account.
            </p>
            <Button href="/login" variant="outline" fullWidth>
              Go to login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-surface-alt] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[--color-brand-primary]">
            Shadesology
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[--color-text-primary]">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            Already have one?{" "}
            <Link href="/login" className="font-medium text-[--color-brand-primary] hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[--shadow-lg] p-8">
          {serverError && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[--color-error]">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                autoComplete="given-name"
                value={form.firstName}
                onChange={set("firstName")}
                error={errors.firstName}
                required
              />
              <Input
                label="Last name"
                autoComplete="family-name"
                value={form.lastName}
                onChange={set("lastName")}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
              error={errors.email}
              required
              placeholder="you@example.com"
            />

            <Input
              label="Phone (optional)"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+1 (555) 000-0000"
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={set("password")}
              error={errors.password}
              hint="Minimum 8 characters."
              required
            />

            <Input
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              error={errors.confirmPassword}
              required
            />

            <Checkbox
              label={
                <>
                  I agree to the{" "}
                  <Link href="/terms" className="underline text-[--color-brand-primary]" target="_blank">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline text-[--color-brand-primary]" target="_blank">
                    Privacy Policy
                  </Link>
                </>
              }
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              error={errors.terms}
              required
            />

            <Button type="submit" fullWidth isLoading={loading} size="lg">
              Create account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
