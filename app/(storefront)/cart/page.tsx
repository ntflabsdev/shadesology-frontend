"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon, type Cart, type CartItem } from "@/lib/cart";
import { t } from "@/lib/api";
import { DeliveryEstimate } from "@/components/shipping/DeliveryEstimate";
import { PaymentCalculator } from "@/components/financing/PaymentCalculator";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatCurrency } from "@/i18n/format";

export default function CartPage() {
  const { toast } = useToast();
  const { locale } = useLocaleSettings();
  const [cart, setCart]         = useState<Cart | null>(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // itemId being updated
  const [couponInput, setCouponInput]     = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const loadCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      toast({ title: "Couldn't load cart", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadCart(); }, [loadCart]);

  async function handleQtyChange(item: CartItem, newQty: number) {
    setUpdating(item._id);
    try {
      await updateCartItem(item._id, newQty);
      await loadCart();
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Update failed", variant: "error" });
    } finally {
      setUpdating(null);
    }
  }

  async function handleRemove(item: CartItem) {
    setUpdating(item._id);
    try {
      await removeFromCart(item._id);
      await loadCart();
      toast({ title: `${t(item.product.name, locale)} removed`, variant: "info" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Remove failed", variant: "error" });
    } finally {
      setUpdating(null);
    }
  }

  async function handleApplyCoupon(ev: React.FormEvent) {
    ev.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await applyCoupon(couponInput.trim());
      toast({ title: res.message, variant: "success" });
      setCouponInput("");
      await loadCart();
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Invalid coupon", variant: "error" });
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleRemoveCoupon(code: string) {
    try {
      await removeCoupon(code);
      await loadCart();
      toast({ title: `Coupon "${code}" removed`, variant: "info" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to remove coupon", variant: "error" });
    }
  }

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <svg className="animate-spin mx-auto h-8 w-8 text-[--color-brand-primary]" fill="none" viewBox="0 0 24 24" aria-label="Loading cart">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    );
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold text-[--color-text-primary] mb-8">Your Cart</h1>

      {isEmpty ? (
        <div className="text-center py-20 max-w-md mx-auto">
          <svg className="mx-auto mb-4 opacity-20 h-16 w-16" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M6 6h4l5.6 22.4A4 4 0 0019.5 32h19a4 4 0 003.9-3.1L46 14H14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="40" r="2" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="38" cy="40" r="2" stroke="currentColor" strokeWidth="2.5" />
          </svg>
          <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-[--color-text-muted] mb-6">Browse our products and add something you love.</p>
          <Button href="/products">Browse Products</Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Item list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Price change notice */}
            {cart.items.some((i) => i.priceChanged) && (
              <div role="alert" className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                Some prices have changed since you added items to your cart. The totals below reflect the current prices.
              </div>
            )}

            <DeliveryEstimate variantIds={cart.items.map((item) => item.variant._id)} />

            {cart.items.map((item) => (
              <div
                key={item._id}
                className={`flex gap-4 p-4 rounded-xl border bg-white transition-opacity ${updating === item._id ? "opacity-60 pointer-events-none" : "border-[--color-border]"}`}
              >
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[--color-neutral-100] shrink-0">
                  {item.product.image?.url ? (
                    <Image
                      src={item.product.image.url}
                      alt={t(item.product.image.alt, locale) || t(item.product.name, locale)}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[--color-neutral-400]" aria-hidden="true">
                      <svg fill="none" viewBox="0 0 24 24" className="h-8 w-8"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" /></svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.product.slug}`} className="font-semibold text-[--color-text-primary] hover:text-[--color-brand-primary] line-clamp-1">
                    {t(item.product.name, locale)}
                  </Link>
                  <p className="text-xs text-[--color-text-muted] mt-0.5">{t(item.variant.name, locale)} · SKU: {item.variant.sku}</p>

                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    {/* Qty stepper */}
                    <div className="flex items-center border border-[--color-border] rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQtyChange(item, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="px-2.5 py-1.5 text-[--color-text-muted] hover:bg-[--color-neutral-100] transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                      </button>
                      <span className="px-3 py-1.5 text-sm font-medium min-w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(item, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="px-2.5 py-1.5 text-[--color-text-muted] hover:bg-[--color-neutral-100] transition-colors"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item)}
                      className="text-xs text-[--color-error] hover:underline"
                    >
                      Remove
                    </button>

                    {item.priceChanged && (
                      <span className="text-xs text-amber-600 font-medium">Price updated</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <p className="font-bold text-[--color-text-primary]">
                    {formatCurrency(item.pricing.lineTotal, "USD", "USD", locale)}
                  </p>
                  {item.pricing.totalSurcharge > 0 && (
                    <p className="text-xs text-[--color-text-muted] mt-0.5">
                      +{formatCurrency(item.pricing.totalSurcharge, "USD", "USD", locale)} options
                    </p>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-4 flex justify-between items-center">
              <Button href="/products" variant="ghost" size="sm">← Continue Shopping</Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-[--color-border] p-6 space-y-4 sticky top-24">
              <h2 className="font-bold text-[--color-text-primary] text-lg">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[--color-text-muted]">
                  <span>Subtotal ({cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""})</span>
                  <span>{formatCurrency(cart.totals.subtotal, "USD", "USD", locale)}</span>
                </div>

                {cart.totals.orderDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>{formatCurrency(-cart.totals.orderDiscount, "USD", "USD", locale)}</span>
                  </div>
                )}

                {cart.totals.appliedPromos?.map((p) => (
                  <div key={p.code ?? p.label} className="flex justify-between text-green-600 text-xs">
                    <span>{p.label}</span>
                    <span>{formatCurrency(-p.discountAmount, "USD", "USD", locale)}</span>
                  </div>
                ))}

                <div className="flex justify-between text-[--color-text-muted]">
                  <span>Shipping</span>
                  <span className="text-[--color-text-primary]">Calculated at checkout</span>
                </div>

                <div className="flex justify-between text-[--color-text-muted]">
                  <span>Tax</span>
                  <span className="text-[--color-text-primary]">Calculated at checkout</span>
                </div>

                <div className="flex justify-between font-bold text-[--color-text-primary] text-base pt-3 border-t border-[--color-border]">
                  <span>Estimated Total</span>
                  <span>{formatCurrency(cart.totals.orderSubtotal, "USD", "USD", locale)}</span>
                </div>
              </div>

              <Button href="/checkout" fullWidth size="lg">
                Proceed to Checkout
              </Button>

              {cart.totals.orderSubtotal > 0 && (
                <PaymentCalculator amount={cart.totals.orderSubtotal} title="Cart payment estimate" compact />
              )}

              {/* Coupon code */}
              <div>
                {cart.couponCodes.length > 0 && (
                  <ul className="space-y-1 mb-2">
                    {cart.couponCodes.map((code) => (
                      <li key={code} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs">
                        <span className="font-mono font-medium text-green-700">{code}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoupon(code)}
                          className="text-[--color-error] hover:underline ml-2"
                          aria-label={`Remove coupon ${code}`}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    aria-label="Coupon code"
                    autoComplete="off"
                    className="flex-1 border border-[--color-border] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-primary]"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    isLoading={couponLoading}
                    disabled={!couponInput.trim()}
                  >
                    Apply
                  </Button>
                </form>
              </div>

              <p className="text-center text-xs text-[--color-text-muted]">
                Secure checkout — SSL encrypted
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
