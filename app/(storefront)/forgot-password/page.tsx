"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-surface-alt] px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-[--shadow-lg] p-10">
            <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M4 8l10 7 10-7" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
                <rect x="4" y="6" width="20" height="16" rx="2" stroke="#2563EB" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[--color-text-primary] mb-2">
              Check your email
            </h1>
            <p className="text-sm text-[--color-text-muted] mb-6">
              If <strong>{email}</strong> is registered, we sent a password reset link.
              It expires in 1 hour.
            </p>
            <p className="text-xs text-[--color-text-muted] mb-6">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                onClick={() => { setSent(false); }}
                className="text-[--color-brand-primary] underline"
              >
                try again
              </button>
              .
            </p>
            <Button href="/login" variant="outline" fullWidth>
              Back to login
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
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[--shadow-lg] p-8">
          {error && (
            <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[--color-error]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />

            <Button type="submit" fullWidth isLoading={loading} size="lg">
              Send reset link
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link href="/login" className="text-sm text-[--color-brand-primary] hover:underline">
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
