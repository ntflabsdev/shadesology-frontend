"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { getRewardState, validateReferralCode } from "@/lib/advancedEcommerce";

export function ReferralRewards() {
  const [code, setCode] = useState("SHADE-ALPHA");
  const [message, setMessage] = useState("Eligible for referral rewards");
  const state = getRewardState(code);

  function handleValidate() {
    const result = validateReferralCode(code, "customer-123");
    setMessage(result.valid ? "Referral code accepted. Reward points are available." : result.reason || "Referral code rejected.");
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-[--color-text-primary]">Rewards & referrals</h2>
      </CardHeader>
      <CardBody>
        <div className="rounded-xl border border-[--color-border] bg-[--color-neutral-50] p-4">
          <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Points balance</p>
          <p className="mt-2 text-3xl font-bold text-[--color-text-primary]">{state.pointsBalance}</p>
          <p className="mt-1 text-sm text-[--color-text-muted]">{state.referredCustomers} successful referrals this year</p>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-[--color-text-primary]">
            Referral code
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="mt-2 w-full rounded-xl border border-[--color-border] bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
            />
          </label>
          <Button type="button" variant="secondary" onClick={handleValidate}>Check referral status</Button>
          <p className="text-sm text-[--color-text-muted]">{message}</p>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-[--color-text-muted]">
          <li>• Reward points redeem at checkout for eligible orders.</li>
          <li>• Self-referral attempts are blocked automatically.</li>
          <li>• Referral commissions are tracked against the shared customer identity model.</li>
        </ul>
      </CardBody>
    </Card>
  );
}
