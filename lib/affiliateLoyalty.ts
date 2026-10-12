export type LoyaltyTier = "silver" | "gold" | "platinum";

export interface AffiliateStats {
  clicks: number;
  conversions: number;
  qualifiedSales: number;
  commissionRate: number;
  pendingCommission: number;
  status: "approved" | "pending" | "paused";
  code: string;
}

export interface LoyaltyTierInfo {
  tier: LoyaltyTier;
  title: string;
  points: number;
  nextTier: string;
  discount: string;
  requirements: string[];
}

export function getAffiliateStats(): AffiliateStats {
  return {
    clicks: 482,
    conversions: 34,
    qualifiedSales: 18,
    commissionRate: 6,
    pendingCommission: 1420,
    status: "approved",
    code: "SHADE-REF-2048",
  };
}

export function getLoyaltyTier(points: number): LoyaltyTierInfo {
  if (points >= 1500) {
    return {
      tier: "platinum",
      title: "Platinum rewards",
      points,
      nextTier: "Maxed out",
      discount: "8% storewide credit",
      requirements: ["Priority service", "Early access to seasonal drops", "Dedicated support line"],
    };
  }

  if (points >= 800) {
    return {
      tier: "gold",
      title: "Gold rewards",
      points,
      nextTier: "1,500 pts",
      discount: "5% on eligible orders",
      requirements: ["Complimentary care review", "Faster quote turnaround", "Annual maintenance credit"],
    };
  }

  return {
    tier: "silver",
    title: "Silver rewards",
    points,
    nextTier: "800 pts",
    discount: "2% point redemption",
    requirements: ["Earn on purchase milestones", "Redeem on future orders", "Seasonal offers access"],
  };
}

export function calculateRefundedPoints(pointsRedeemed: number, refundedAmount: number): number {
  const reverseRate = refundedAmount > 0 ? Math.min(1, pointsRedeemed / Math.max(1, refundedAmount)) : 0;
  return Math.round(pointsRedeemed * reverseRate);
}

export function validateAffiliateSelfReferral(code: string, customerId?: string): { valid: boolean; reason?: string } {
  const cleaned = code.trim();
  if (!cleaned) return { valid: false, reason: "Enter an affiliate or referral code." };
  if (customerId && cleaned.toUpperCase() === customerId.toUpperCase()) {
    return { valid: false, reason: "Self-referral is blocked to prevent reward abuse." };
  }
  return { valid: true };
}
