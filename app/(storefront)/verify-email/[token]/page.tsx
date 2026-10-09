"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { verifyEmail } from "@/lib/api";

interface Props {
  params: Promise<{ token: string }>;
}

type Status = "verifying" | "success" | "error";

export default function VerifyEmailPage({ params }: Props) {
  const router               = useRouter();
  const [status, setStatus]  = useState<Status>("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    params.then(async (p) => {
      try {
        const result = await verifyEmail(p.token);
        setMessage(result.message || "Email verified!");
        setStatus("success");
        router.refresh();
        setTimeout(() => router.push("/account"), 3000);
      } catch (err: unknown) {
        setMessage(err instanceof Error ? err.message : "Verification failed.");
        setStatus("error");
      }
    });
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[--color-surface-alt] px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-[--shadow-lg] p-10">
          {status === "verifying" && (
            <>
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-[--color-neutral-100] flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-[--color-brand-primary]" fill="none" viewBox="0 0 24 24" aria-label="Verifying">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[--color-text-primary]">Verifying your email…</h1>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M5 14l6 6L23 8" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[--color-text-primary] mb-2">Email verified!</h1>
              <p className="text-sm text-[--color-text-muted] mb-6">
                {message} Redirecting to your account&hellip;
              </p>
              <Button href="/account" fullWidth>Go to my account</Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path d="M7 7l14 14M21 7L7 21" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-[--color-text-primary] mb-2">Verification failed</h1>
              <p className="text-sm text-[--color-text-muted] mb-6">{message}</p>
              <div className="space-y-3">
                <Button href="/register" fullWidth>Create a new account</Button>
                <Link href="/login" className="block text-sm text-[--color-brand-primary] hover:underline">
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
