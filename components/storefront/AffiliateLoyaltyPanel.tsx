"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  calculateRefundedPoints,
  getAffiliateStats,
  getLoyaltyTier,
  validateAffiliateSelfReferral,
} from "@/lib/affiliateLoyalty";

export function AffiliateLoyaltyPanel() {
  const affiliate = getAffiliateStats();
  const tier = getLoyaltyTier(1260);
  const [partnerCode, setPartnerCode] = useState(affiliate.code);
  const [statusMessage, setStatusMessage] = useState("Affiliate status is approved and ready for payout review.");

  function handleCodeCheck() {
    const result = validateAffiliateSelfReferral(partnerCode, "customer-123");
    setStatusMessage(
      result.valid
        ? "Partner code accepted. Tracking and commission calculations remain active."
        : result.reason || "Partner code rejected.",
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[--color-text-primary]">Affiliate program</h2>
        </CardHeader>
        <CardBody>
          <div className="rounded-xl border border-[--color-border] bg-[--color-neutral-50] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Program status</p>
                <p className="mt-1 text-xl font-bold text-[--color-text-primary]">{affiliate.status}</p>
              </div>
              <Badge variant={affiliate.status === "approved" ? "success" : "warning"}>{affiliate.status}</Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Clicks</p>
                <p className="mt-1 text-lg font-bold text-[--color-text-primary]">{affiliate.clicks}</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Conversions</p>
                <p className="mt-1 text-lg font-bold text-[--color-text-primary]">{affiliate.conversions}</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Qualified sales</p>
                <p className="mt-1 text-lg font-bold text-[--color-text-primary]">{affiliate.qualifiedSales}</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Pending payout</p>
                <p className="mt-1 text-lg font-bold text-[--color-text-primary]">${affiliate.pendingCommission}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Partner code
              <input
                value={partnerCode}
                onChange={(event) => setPartnerCode(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>
            <Button type="button" variant="secondary" onClick={handleCodeCheck}>Validate link</Button>
            <p className="text-sm text-[--color-text-muted]">{statusMessage}</p>
          </div>

          <div className="mt-4 rounded-xl border border-[--color-border] bg-white p-4 text-sm text-[--color-text-muted]">
            Commission rate: <span className="font-semibold text-[--color-text-primary]">{affiliate.commissionRate}%</span>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[--color-text-primary]">Loyalty program</h2>
        </CardHeader>
        <CardBody>
          <div className="rounded-xl border border-[--color-border] bg-[--color-neutral-50] p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-[--color-text-muted]">Current tier</p>
            <p className="mt-2 text-2xl font-bold text-[--color-text-primary]">{tier.title}</p>
            <p className="mt-1 text-sm text-[--color-text-muted]">{tier.points} points · {tier.discount}</p>
          </div>

          <ul className="mt-4 space-y-2 text-sm text-[--color-text-muted]">
            {tier.requirements.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-xl border border-[--color-border] bg-white p-4 text-sm text-[--color-text-muted]">
            <p className="font-semibold text-[--color-text-primary]">Refund safety</p>
            <p className="mt-2">
              If a qualifying order is refunded, points are reversed before the next reward settlement. This protects the program from duplicate redemption and accidental payout leakage.
            </p>
            <p className="mt-3 font-medium text-[--color-text-primary]">
              Example reversal: {calculateRefundedPoints(350, 180)} points returned for a refunded order value of $180.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
