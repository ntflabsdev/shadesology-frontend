"use client";

/**
 * Cart API helpers — thin wrappers around the /api/cart endpoints.
 * All cart state is server-managed; the frontend just calls the API.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface CartOption {
  name: string;
  surchargeType: "none" | "fixed" | "percent" | "per_unit";
  surchargeAmount: number;
}

export interface CartItemPricing {
  displayPrice: number;
  priceType: string;
  surcharges: { label: string; type: string; amount: number }[];
  totalSurcharge: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartItem {
  _id: string;
  product: { _id: string; name: { en: string }; slug: string; image?: { url: string; alt: { en: string } } };
  variant: { _id: string; name: { en: string } | string; sku: string; availability: string; leadTimeDays?: number };
  quantity: number;
  selectedOptions: Record<string, unknown>;
  pricing: CartItemPricing;
  priceChanged: boolean;
  snapshotPrice?: number;
  isAvailable: boolean;
}

export interface CartTotals {
  subtotal: number;
  orderDiscount: number;
  appliedPromos: { label: string; discountAmount: number; code: string | null }[];
  orderSubtotal: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  totals: CartTotals;
  couponCodes: string[];
  itemCount: number;
}

export interface PlaceOrderPayload {
  contact: { firstName: string; lastName: string; email: string; phone?: string };
  shipping: { line1: string; line2?: string; city: string; state: string; zip: string; country?: string };
  billing?: { firstName?: string; lastName?: string; line1: string; line2?: string; city: string; state: string; zip: string; country?: string };
  sameAsBilling?: boolean;
  checkoutToken: string;
  paymentMethod: "card" | "bank_transfer" | "purchase_order";
  paymentPlan: "full" | "deposit";
  purchaseOrderNumber?: string;
}

export interface CheckoutQuote {
  checkoutToken: string;
  quoteRequired: boolean;
  reason?: string;
  subtotal?: number;
  discountAmount?: number;
  shipping?: {
    label: string;
    carrierName: string;
    cost: number;
    charges: { label: string; amount: number }[];
    productionDays: number;
    transitDays: number;
    estimatedDeliveryDate: string;
  };
  tax?: number;
  taxRate?: number | null;
  total?: number;
  currency?: string;
  expiresAt?: string;
}

export interface PlaceOrderResult {
  orderId: string;
  orderNumber: string;
  purchaseOrderNumber?: string;
  total: number;
  priceChanges: { variantName: string; oldPrice: number; newPrice: number }[];
  checkoutUrl?: string | null;
  paymentMethod?: "stripe_checkout" | "bank_transfer" | "purchase_order";
  paymentStatus?: string;
  amountDueNow?: number;
  balanceDue?: number;
  bankTransferInstructions?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    reference: string;
  } | null;
}

async function cartFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/cart${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Cart request failed");
  return json.data as T;
}

export async function getCart(): Promise<Cart> {
  const res = await fetch(`${BASE}/api/cart`, {
    credentials: "include",
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to load cart");
  return json.data as Cart;
}

export async function addToCart(
  productId: string,
  variantId: string,
  quantity: number,
  selectedOptions: Record<string, unknown> = {}
): Promise<{ message: string; itemCount: number }> {
  const res = await fetch(`${BASE}/api/cart/items`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, variantId, quantity, selectedOptions }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to add item");
  return json;
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/cart/items/${itemId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update item");
  return json;
}

export async function removeFromCart(itemId: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/cart/items/${itemId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to remove item");
  return json;
}

export async function clearCart(): Promise<void> {
  await fetch(`${BASE}/api/cart`, { method: "DELETE", credentials: "include" });
}

export async function beginCheckout(contact?: {
  email: string;
  firstName: string;
  lastName: string;
}): Promise<{
  items: CartItem[];
  totals: CartTotals;
  couponCodes: string[];
  priceChanges: unknown[];
  hasPriceChanges: boolean;
}> {
  const res = await fetch(`${BASE}/api/cart/checkout`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contact ?? {}),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Checkout validation failed");
  return json.data;
}

export async function getCheckoutQuote(payload: {
  contact: { firstName: string; lastName: string; phone?: string };
  shipping: { line1: string; line2?: string; city: string; state: string; zip: string; country?: string };
}): Promise<CheckoutQuote> {
  const res = await fetch(`${BASE}/api/cart/checkout-options`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Could not calculate shipping and tax.");
  return json.data as CheckoutQuote;
}

export async function placeOrder(payload: PlaceOrderPayload, idempotencyKey: string): Promise<PlaceOrderResult> {
  const res = await fetch(`${BASE}/api/cart/place-order`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to place order");
  return json.data as PlaceOrderResult;
}

export async function applyCoupon(code: string): Promise<{ message: string; coupon: { code: string; type: string; value: number; name: string } }> {
  const res = await fetch(`${BASE}/api/cart/coupon`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to apply coupon");
  return json;
}

export async function removeCoupon(code: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/cart/coupon/${encodeURIComponent(code)}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to remove coupon");
  return json;
}

export async function mergeGuestCart(): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/cart/merge`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  // merge is best-effort — don't throw on failure
  return json;
}
