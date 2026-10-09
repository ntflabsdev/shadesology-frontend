"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginUser } from "@/lib/api";
import { mergeGuestCart } from "@/lib/cart";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginUser(email, password);
      // Merge any guest cart items into the user's account cart (best-effort)
      await mergeGuestCart().catch(() => null);
      router.push("/account");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-surface-alt] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[--color-brand-primary]">
            Shadesology
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-[--color-text-primary]">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-[--color-text-muted]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-[--color-brand-primary] hover:underline">
              Create one free
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-[--shadow-lg] p-8">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-[--color-error]"
            >
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
            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <div className="mt-1.5 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[--color-brand-primary] hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth isLoading={loading} size="lg">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-[--color-text-muted]">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[--color-brand-primary]">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[--color-brand-primary]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[--color-text-muted]">
          Are you a trade or dealer?{" "}
          <Link href="/dealer" className="font-medium text-[--color-brand-primary] hover:underline">
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
}
