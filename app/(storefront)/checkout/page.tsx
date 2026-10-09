"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/Toast";
import {
  getCart,
  beginCheckout,
  getCheckoutQuote,
  placeOrder,
  applyCoupon,
  removeCoupon,
  type Cart,
  type CheckoutQuote,
  type PlaceOrderResult,
} from "@/lib/cart";
import { t } from "@/lib/api";
import { PaymentCalculator } from "@/components/financing/PaymentCalculator";
import { trackConversion } from "@/lib/conversion";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatAddress, formatCurrency, formatDate } from "@/i18n/format";

type Step = "contact" | "shipping" | "review";

const US_STATES = [
  { value: "AL", label: "Alabama" },   { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },   { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },{ value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },{ value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },   { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },    { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },      { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },     { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },{ value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },{ value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },{ value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },{ value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },      { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },    { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },{ value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },{ value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },     { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },   { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },{ value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
].sort((a, b) => a.label.localeCompare(b.label));

function CheckoutContent() {
  const { locale, country } = useLocaleSettings();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [cart, setCart]               = useState<Cart | null>(null);
  const [loading, setLoading]         = useState(true);
  const [step, setStep]               = useState<Step>("contact");
  const [submitting, setSubmitting]   = useState(false);
  const [orderResult, setOrderResult] = useState<PlaceOrderResult | null>(null);
  const [checkoutQuote, setCheckoutQuote] = useState<CheckoutQuote | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [calculatingCheckout, setCalculatingCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank_transfer">("card");
  const [paymentPlan, setPaymentPlan] = useState<"full" | "deposit">("full");
  const financingReference = searchParams.get("financing_ref") || "";
  const placeOrderKey = useRef<string | null>(null);

  // Form state
  const [contact, setContact] = useState({
    firstName: "", lastName: "", email: "", phone: "",
  });
  const [address, setAddress] = useState({
    line1: "", line2: "", city: "", state: "", zip: "", country,
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Coupon state (on review step)
  const [couponInput, setCouponInput]     = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    getCart()
      .then(setCart)
      .catch(() => toast({ title: "Couldn't load cart", variant: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  // ── Validation ─────────────────────────────────────────────────────────────
  function validateContact() {
    const e: Record<string, string> = {};
    if (!contact.firstName.trim()) e.firstName = "Required";
    if (!contact.lastName.trim())  e.lastName  = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) e.email = "Valid email required";
    return e;
  }

  function validateAddress() {
    const e: Record<string, string> = {};
    if (!address.line1.trim()) e.line1 = "Required";
    if (!address.city.trim())  e.city  = "Required";
    if (!address.state)        e.state = "Required";
    if (!address.zip.trim())   e.zip   = "Required";
    return e;
  }

  // ── Step handlers ──────────────────────────────────────────────────────────
  function handleContactNext(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateContact();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep("shipping");
  }

  async function handleShippingNext(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validateAddress();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    setCalculatingCheckout(true);
    setCheckoutError("");
    setCheckoutQuote(null);
    try {
      const data = await beginCheckout({ email: contact.email, firstName: contact.firstName, lastName: contact.lastName });
      if (data.hasPriceChanges) {
        toast({
          title: "Some prices changed since you added items to your cart. Totals have been updated.",
          variant: "warning",
          duration: 0,
        });
      }
      setCart((prev) =>
        prev ? { ...prev, totals: data.totals, items: data.items, couponCodes: data.couponCodes ?? prev.couponCodes } : prev
      );
      const quote = await getCheckoutQuote({
        contact: { firstName: contact.firstName, lastName: contact.lastName, phone: contact.phone },
        shipping: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          zip: address.zip,
          country: address.country,
        },
      });
      if (quote.quoteRequired) {
        setCheckoutError(quote.reason || "This delivery needs a custom quote.");
        return;
      }
      setCheckoutQuote(quote);
      placeOrderKey.current = null;
      setStep("review");
      trackConversion("checkout_started", {
        currency: quote.currency || "USD",
        value: quote.total ?? cart?.totals.subtotal ?? 0,
        items: (cart?.items ?? []).map((item) => ({
          item_id: item.product._id,
          item_name: t(item.product.name, locale),
          item_variant: typeof item.variant.name === "string" ? item.variant.name : t(item.variant.name, locale),
          price: item.pricing.unitPrice,
          quantity: item.quantity,
        })),
      });
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Shipping and tax could not be calculated.");
    } finally {
      setCalculatingCheckout(false);
    }
  }

  // ── Coupon handlers ────────────────────────────────────────────────────────
  async function handleApplyCoupon(ev: React.FormEvent) {
    ev.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await applyCoupon(couponInput.trim());
      toast({ title: res.message, variant: "success" });
      setCouponInput("");
      // Re-fetch cart to get updated totals
      const updated = await getCart();
      setCart(updated);
      setCheckoutQuote(null);
      setStep("shipping");
      toast({ title: "Review shipping and tax again for your updated cart.", variant: "info" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Invalid coupon", variant: "error" });
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleRemoveCoupon(code: string) {
    try {
      await removeCoupon(code);
      const updated = await getCart();
      setCart(updated);
      setCheckoutQuote(null);
      setStep("shipping");
      toast({ title: `Coupon "${code}" removed`, variant: "info" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to remove coupon", variant: "error" });
    }
  }

  // ── Place order ────────────────────────────────────────────────────────────
  async function handlePlaceOrder(ev: React.FormEvent) {
    ev.preventDefault();
    setSubmitting(true);
    try {
      if (!checkoutQuote?.checkoutToken) throw new Error("Your shipping and tax quote expired. Please review the address again.");
      const result = await placeOrder({
        contact: {
          firstName: contact.firstName,
          lastName:  contact.lastName,
          email:     contact.email,
          phone:     contact.phone || undefined,
        },
        shipping: {
          line1:   address.line1,
          line2:   address.line2 || undefined,
          city:    address.city,
          state:   address.state,
          zip:     address.zip,
          country: address.country,
        },
        sameAsBilling,
        checkoutToken: checkoutQuote.checkoutToken,
        paymentMethod,
        paymentPlan,
      }, placeOrderKey.current ?? (placeOrderKey.current = globalThis.crypto.randomUUID()));

      if (paymentMethod === "card") {
        if (!result.checkoutUrl) throw new Error("The secure payment page is not available. Please retry checkout.");
        window.location.assign(result.checkoutUrl);
        return;
      }

      // Show price-change warning if any prices changed between beginCheckout and now
      if (result.priceChanges?.length) {
        toast({
          title: `Note: ${result.priceChanges.length} price(s) changed. Your order total has been updated.`,
          variant: "warning",
          duration: 0,
        });
      }

      setOrderResult(result);
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to place order. Please try again.", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Order confirmed screen ─────────────────────────────────────────────────
  if (orderResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-surface-alt] px-4 py-12">
        <div className="w-full max-w-md text-center bg-white rounded-2xl shadow-xl p-10">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M6 16l7 7L26 9" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Received!</h1>
          <p className="text-[--color-text-muted] mb-1">
            Thank you, {contact.firstName}! Your order has been placed.
          </p>
          <p className="text-sm text-[--color-text-muted] mb-1">
            Order number: <strong className="text-[--color-text-primary]">{orderResult.orderNumber}</strong>
          </p>
          <p className="text-sm text-[--color-text-muted] mb-6">
            A confirmation email will be sent to <strong>{contact.email}</strong>.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-6 text-left">
            <strong>Next step:</strong> Use your order reference for the bank transfer. We will confirm payment before production.
            {orderResult.amountDueNow != null && <p className="mt-2"><strong>Transfer now:</strong> {formatCurrency(orderResult.amountDueNow, "USD", "USD", locale)}</p>}
            {orderResult.bankTransferInstructions && (
              <dl className="mt-3 space-y-1">
                {orderResult.bankTransferInstructions.bankName && <div><dt className="inline font-semibold">Bank: </dt><dd className="inline">{orderResult.bankTransferInstructions.bankName}</dd></div>}
                {orderResult.bankTransferInstructions.accountName && <div><dt className="inline font-semibold">Account name: </dt><dd className="inline">{orderResult.bankTransferInstructions.accountName}</dd></div>}
                {orderResult.bankTransferInstructions.accountNumber && <div><dt className="inline font-semibold">Account number: </dt><dd className="inline">{orderResult.bankTransferInstructions.accountNumber}</dd></div>}
                {orderResult.bankTransferInstructions.routingNumber && <div><dt className="inline font-semibold">Routing number: </dt><dd className="inline">{orderResult.bankTransferInstructions.routingNumber}</dd></div>}
                <div><dt className="inline font-semibold">Transfer reference: </dt><dd className="inline">{orderResult.bankTransferInstructions.reference}</dd></div>
                {orderResult.balanceDue ? <div><dt className="inline font-semibold">Balance due before dispatch: </dt><dd className="inline">{formatCurrency(orderResult.balanceDue, "USD", "USD", locale)}</dd></div> : null}
              </dl>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Button href="/account">View My Orders</Button>
            <Button href="/products" variant="ghost">Continue Shopping</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step progress bar ──────────────────────────────────────────────────────
  const steps: { id: Step; label: string }[] = [
    { id: "contact",  label: "Contact" },
    { id: "shipping", label: "Shipping" },
    { id: "review",   label: "Review & Pay" },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[--color-surface-alt]">
      {/* Top bar */}
      <header className="bg-white border-b border-[--color-border] py-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-[--color-brand-primary]">Shadesology</Link>
          <Link href="/cart" className="text-sm text-[--color-brand-primary] hover:underline">← Back to cart</Link>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Progress */}
        <nav aria-label="Checkout progress" className="mb-8">
          <ol className="flex items-center gap-0">
            {steps.map((s, i) => (
              <React.Fragment key={s.id}>
                <li className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < stepIndex  ? "bg-green-500 text-white" :
                      i === stepIndex ? "bg-[--color-brand-primary] text-white" :
                      "bg-[--color-neutral-200] text-[--color-text-muted]"
                    }`}
                    aria-current={i === stepIndex ? "step" : undefined}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </span>
                  <span className={`text-sm font-medium hidden sm:block ${i === stepIndex ? "text-[--color-brand-primary]" : "text-[--color-text-muted]"}`}>
                    {s.label}
                  </span>
                </li>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-[--color-border] mx-3" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </ol>
        </nav>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form area */}
          <div className="lg:col-span-3 space-y-4">

            {/* ── Step 1: Contact ── */}
            {step === "contact" && (
              <section className="bg-white rounded-2xl border border-[--color-border] p-6">
                <h2 className="text-lg font-bold mb-5">Contact information</h2>
                <form onSubmit={handleContactNext} noValidate className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First name"
                      value={contact.firstName}
                      onChange={(e) => setContact(p => ({ ...p, firstName: e.target.value }))}
                      error={errors.firstName}
                      required
                      autoComplete="given-name"
                    />
                    <Input
                      label="Last name"
                      value={contact.lastName}
                      onChange={(e) => setContact(p => ({ ...p, lastName: e.target.value }))}
                      error={errors.lastName}
                      required
                      autoComplete="family-name"
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={contact.email}
                    onChange={(e) => setContact(p => ({ ...p, email: e.target.value }))}
                    error={errors.email}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    value={contact.phone}
                    onChange={(e) => setContact(p => ({ ...p, phone: e.target.value }))}
                    autoComplete="tel"
                  />
                  <Button type="submit" fullWidth size="lg" data-conversion-event="primary_cta_click">Continue to Shipping</Button>
                </form>
              </section>
            )}

            {/* ── Step 2: Shipping ── */}
            {step === "shipping" && (
              <section className="bg-white rounded-2xl border border-[--color-border] p-6">
                <h2 className="text-lg font-bold mb-5">Shipping address</h2>
                <form onSubmit={handleShippingNext} noValidate className="space-y-4">
                  <Input
                    label="Address line 1"
                    value={address.line1}
                    onChange={(e) => setAddress(p => ({ ...p, line1: e.target.value }))}
                    error={errors.line1}
                    required
                    autoComplete="address-line1"
                  />
                  <Input
                    label="Address line 2 (optional)"
                    value={address.line2}
                    onChange={(e) => setAddress(p => ({ ...p, line2: e.target.value }))}
                    autoComplete="address-line2"
                  />
                  <Input
                    label="City"
                    value={address.city}
                    onChange={(e) => setAddress(p => ({ ...p, city: e.target.value }))}
                    error={errors.city}
                    required
                    autoComplete="address-level2"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="State"
                      options={US_STATES}
                      value={address.state}
                      onChange={(e) => setAddress(p => ({ ...p, state: e.target.value }))}
                      error={errors.state}
                      required
                      placeholder="Select state"
                    />
                    <Input
                      label="ZIP code"
                      value={address.zip}
                      onChange={(e) => setAddress(p => ({ ...p, zip: e.target.value }))}
                      error={errors.zip}
                      required
                      autoComplete="postal-code"
                      inputMode="numeric"
                    />
                  </div>
                  <Checkbox
                    label="Billing address same as shipping"
                    checked={sameAsBilling}
                    onChange={(e) => setSameAsBilling(e.target.checked)}
                  />
                  {checkoutError && (
                    <div role="alert" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
                      <p>{checkoutError}</p>
                      {checkoutError.toLowerCase().includes("quote") || checkoutError.toLowerCase().includes("freight")
                        ? <Link href="/quote/basket" className="mt-2 inline-block font-semibold underline">Request a freight quote</Link>
                        : null}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => setStep("contact")}>← Back</Button>
                    <Button type="submit" fullWidth size="lg" isLoading={calculatingCheckout} data-conversion-event="primary_cta_click">Review Order</Button>
                  </div>
                </form>
              </section>
            )}

            {/* ── Step 3: Review & Place Order ── */}
            {step === "review" && (
              <>
                {/* Price-change notice */}
                {cart?.items.some((i) => i.priceChanged) && (
                  <div role="alert" className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    Some prices changed since you added items. The totals below reflect current prices.
                  </div>
                )}

                <section className="bg-white rounded-2xl border border-[--color-border] p-6">
                  <h2 className="text-lg font-bold mb-4">Review your order</h2>

                  {/* Contact + shipping summary */}
                  <div className="space-y-1.5 text-sm mb-5">
                    <div className="flex justify-between text-[--color-text-muted]">
                      <span>Contact</span>
                      <span className="text-[--color-text-primary]">{contact.firstName} {contact.lastName} · {contact.email}</span>
                    </div>
                    <div className="flex justify-between text-[--color-text-muted]">
                      <span>Ship to</span>
                      <span className="text-right text-[--color-text-primary] max-w-xs">
                        {formatAddress({ line1: address.line1, line2: address.line2, city: address.city, state: address.state, postalCode: address.zip, country: address.country }, locale)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[--color-text-muted]">Billing</span>
                      <span className="text-[--color-text-primary]">{sameAsBilling ? "Same as shipping" : "Different address"}</span>
                    </div>
                  </div>

                  <div className="border-t border-[--color-border] pt-4">
                    <button
                      type="button"
                      className="text-sm text-[--color-brand-primary] hover:underline mb-4 block"
                      onClick={() => setStep("shipping")}
                    >
                      Edit address
                    </button>
                  </div>

                  {/* Coupon code input */}
                  <div className="mb-5">
                    <p className="text-sm font-medium mb-2">Coupon code</p>

                    {/* Applied coupons */}
                    {cart?.couponCodes && cart.couponCodes.length > 0 && (
                      <ul className="space-y-1 mb-2">
                        {cart.couponCodes.map((code) => (
                          <li key={code} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-sm">
                            <span className="font-mono font-medium text-green-700">{code}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCoupon(code)}
                              className="text-xs text-[--color-error] hover:underline ml-3"
                              aria-label={`Remove coupon ${code}`}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}

                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input
                        label=""
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="flex-1"
                        autoComplete="off"
                        aria-label="Coupon code"
                      />
                      <Button
                        type="submit"
                        data-conversion-event="primary_cta_click"
                        variant="secondary"
                        isLoading={couponLoading}
                        disabled={!couponInput.trim()}
                      >
                        Apply
                      </Button>
                    </form>
                  </div>

                  {checkoutQuote && (
                    <div className="mb-5 rounded-xl border border-[--color-border] p-4">
                      <h3 className="mb-2 text-sm font-semibold">Shipping and tax</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between gap-4"><span>{checkoutQuote.shipping?.label ?? "Shipping"}{checkoutQuote.shipping?.carrierName ? ` · ${checkoutQuote.shipping.carrierName}` : ""}</span><span>{formatCurrency(checkoutQuote.shipping?.cost ?? 0, "USD", "USD", locale)}</span></div>
                        {checkoutQuote.shipping?.charges.map((charge) => (
                          <div key={charge.label} className="flex justify-between gap-4 text-[--color-text-muted]"><span>{charge.label}</span><span>{formatCurrency(charge.amount, "USD", "USD", locale)}</span></div>
                        ))}
                        <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(checkoutQuote.tax ?? 0, "USD", "USD", locale)}</span></div>
                        {checkoutQuote.shipping?.estimatedDeliveryDate && (
                          <p className="pt-1 text-xs text-[--color-text-muted]">
                            Estimated delivery {formatDate(checkoutQuote.shipping.estimatedDeliveryDate, locale)} ({checkoutQuote.shipping.productionDays} production + {checkoutQuote.shipping.transitDays} transit days)
                          </p>
                        )}
                        {checkoutQuote.expiresAt && <p className="text-xs text-[--color-text-muted]">Quote valid until {formatDate(checkoutQuote.expiresAt, locale, { hour: "numeric", minute: "2-digit" })}.</p>}
                      </div>
                    </div>
                  )}

                  {checkoutQuote?.total != null && (
                    <div className="mb-5">
                      <PaymentCalculator
                        amount={checkoutQuote.total}
                        title="Financing and payment estimate"
                        applicationReference={financingReference || undefined}
                        showLeaseInquiry
                      />
                    </div>
                  )}

                  <div className="bg-[--color-neutral-50] rounded-xl border border-[--color-border] p-4 mb-5">
                    <p className="text-sm font-semibold mb-1">Payment</p>
                    <div className="space-y-2 text-sm">
                      <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />Card or wallet (secure Stripe checkout)</label>
                      <label className="flex items-center gap-2"><input type="radio" name="paymentMethod" checked={paymentMethod === "bank_transfer"} onChange={() => setPaymentMethod("bank_transfer")} />Bank transfer</label>
                    </div>
                    <label className="mt-4 block text-sm">
                      <span className="mb-1 block font-medium">Payment amount</span>
                      <select className="w-full rounded-md border border-[--color-border] bg-white px-3 py-2" value={paymentPlan} onChange={(event) => setPaymentPlan(event.target.value as "full" | "deposit")}>
                        <option value="full">Pay in full</option>
                        <option value="deposit">Pay deposit now; balance before dispatch</option>
                      </select>
                    </label>
                  </div>

                  <form onSubmit={handlePlaceOrder}>
                    <div className="flex gap-3">
                      <Button type="button" variant="ghost" onClick={() => setStep("shipping")}>← Back</Button>
                      <Button type="submit" fullWidth size="lg" isLoading={submitting} data-conversion-event="primary_cta_click">
                        {paymentMethod === "card" ? "Continue to secure payment" : "Place bank transfer order"}
                      </Button>
                    </div>
                  </form>
                  <p className="mt-4 text-xs text-[--color-text-muted]">
                    By placing your order, you agree to our <Link href="/terms" className="underline">terms</Link> and
                    {" "}<Link href="/refunds" className="underline">return, refund, and cancellation policy</Link>.
                    {" "}See <Link href="/warranty" className="underline">product warranty coverage</Link>.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* ── Order summary sidebar ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[--color-border] p-5 sticky top-24">
              <h2 className="font-bold mb-4">Order Summary</h2>

              {loading ? (
                <p className="text-sm text-[--color-text-muted]">Loading…</p>
              ) : cart ? (
                <>
                  <ul className="space-y-3 mb-4 max-h-60 overflow-y-auto" aria-label="Cart items">
                    {cart.items.map((item) => (
                      <li key={item._id} className="flex items-center gap-3 text-sm">
                        <div className="relative w-10 h-10 rounded bg-[--color-neutral-100] shrink-0 overflow-hidden">
                          {item.product.image?.url && (
                            <Image
                              src={item.product.image.url}
                              alt=""
                              fill
                              sizes="40px"
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{t(item.product.name, locale)}</p>
                          <p className="text-[--color-text-muted] text-xs">Qty: {item.quantity}</p>
                          {item.priceChanged && (
                            <span className="text-xs text-amber-600 font-medium">Price updated</span>
                          )}
                        </div>
                        <span className="font-medium shrink-0">
                          {formatCurrency(item.pricing.lineTotal, "USD", "USD", locale)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-[--color-border] pt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between text-[--color-text-muted]">
                      <span>Subtotal</span>
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
                      <span>{checkoutQuote ? formatCurrency(checkoutQuote.shipping?.cost ?? 0, "USD", "USD", locale) : "Calculated at checkout"}</span>
                    </div>
                    <div className="flex justify-between text-[--color-text-muted]">
                      <span>Tax</span>
                      <span>{checkoutQuote ? formatCurrency(checkoutQuote.tax ?? 0, "USD", "USD", locale) : "Calculated at checkout"}</span>
                    </div>

                    <div className="flex justify-between font-bold text-[--color-text-primary] text-base pt-2 border-t border-[--color-border]">
                      <span>{checkoutQuote ? "Estimated Total" : "Subtotal before shipping and tax"}</span>
                      <span>{formatCurrency(checkoutQuote?.total ?? cart.totals.orderSubtotal, "USD", "USD", locale)}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="container py-12">Loading checkout…</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
