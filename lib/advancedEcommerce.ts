export interface WishlistItem {
  slug: string;
  name: string;
  addedAt: string;
}

export interface ReferralRewardState {
  referralCode: string;
  pointsBalance: number;
  referredCustomers: number;
  eligibleForReward: boolean;
  selfReferralBlocked: boolean;
}

const WISHLIST_KEY = "shadesology:wishlist";

export function getStoredWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(WISHLIST_KEY);
    return raw ? (JSON.parse(raw) as WishlistItem[]) : [];
  } catch {
    return [];
  }
}

export function isWishlisted(slug: string): boolean {
  return getStoredWishlist().some((item) => item.slug === slug);
}

export function toggleWishlistItem(slug: string, name: string): WishlistItem[] {
  if (typeof window === "undefined") return [];

  const current = getStoredWishlist();
  const next = current.some((item) => item.slug === slug)
    ? current.filter((item) => item.slug !== slug)
    : [...current, { slug, name, addedAt: new Date().toISOString() }];

  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("wishlist:updated", { detail: { count: next.length } }));
  return next;
}

export function getRewardState(referralCode?: string, currentCustomerId?: string): ReferralRewardState {
  const normalized = (referralCode || "SHADE-ALPHA").trim().toUpperCase();
  const selfReferralBlocked = Boolean(currentCustomerId && normalized === currentCustomerId.toUpperCase());

  return {
    referralCode: normalized,
    pointsBalance: 280,
    referredCustomers: 3,
    eligibleForReward: !selfReferralBlocked && normalized.length >= 6,
    selfReferralBlocked,
  };
}

export function validateReferralCode(code: string, currentCustomerId?: string): { valid: boolean; reason?: string } {
  const cleaned = code.trim();
  if (!cleaned) return { valid: false, reason: "Enter a referral code to continue." };
  if (cleaned.length < 6) return { valid: false, reason: "Referral codes must be at least 6 characters." };
  if (currentCustomerId && cleaned.toUpperCase() === currentCustomerId.toUpperCase()) {
    return { valid: false, reason: "Self-referrals are not eligible for rewards." };
  }
  return { valid: true };
}
