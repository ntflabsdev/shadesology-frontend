"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";
import { formatCurrency } from "@/i18n/format";
import {
  calculateMonthlyPayment,
  createFinancingApplication,
  createLeaseApplication,
  getFinancingApplication,
  getFinancingOptions,
  type FinancingApplicationStatus,
  type FinancingOptions,
} from "@/lib/financing";

interface Props {
  amount: number;
  title?: string;
  applicationReference?: string;
  showLeaseInquiry?: boolean;
  compact?: boolean;
}

const BASE_DISCLOSURE = "Payment examples are estimates, not a credit offer or commitment. Actual terms, approval, APR and payment depend on lender review. Taxes and shipping may not be included unless shown in the displayed purchase amount.";

export function PaymentCalculator({
  amount,
  title = "Financing estimate",
  applicationReference,
  showLeaseInquiry = false,
  compact = false,
}: Props) {
  const { locale } = useLocaleSettings();
  const [options, setOptions] = useState<FinancingOptions | null>(null);
  const [optionsError, setOptionsError] = useState("");
  const [offerId, setOfferId] = useState("");
  const [customAmountState, setCustomAmountState] = useState({ sourceAmount: amount, value: amount });
  const customAmount = customAmountState.sourceAmount === amount ? customAmountState.value : amount;
  const [application, setApplication] = useState<FinancingApplicationStatus | null>(null);
  const [consumerOpen, setConsumerOpen] = useState(false);
  const [leaseOpen, setLeaseOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [consumer, setConsumer] = useState({ firstName: "", lastName: "", email: "", consent: false });
  const [lease, setLease] = useState({ firstName: "", lastName: "", email: "", company: "", consent: false });

  useEffect(() => {
    let active = true;
    getFinancingOptions(amount > 0 ? amount : undefined)
      .then((data) => {
        if (!active) return;
        setOptions(data);
        setOptionsError("");
      })
      .catch((err: unknown) => {
        if (!active) return;
        setOptionsError(err instanceof Error ? err.message : "Provider is temporarily unavailable.");
      });
    return () => { active = false; };
  }, [amount]);

  useEffect(() => {
    if (!applicationReference) return;
    let active = true;
    getFinancingApplication(applicationReference)
      .then((data) => {
        if (!active) return;
        setApplication(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not retrieve application status.");
      });
    return () => { active = false; };
  }, [applicationReference]);

  const offers = useMemo(() => (options?.offers ?? []).filter((offer) =>
    customAmount >= offer.minimumAmount && (offer.maximumAmount == null || customAmount <= offer.maximumAmount)
  ), [customAmount, options]);
  const selectedOffer = offers.find((offer) => offer._id === offerId);
  const apr = selectedOffer?.apr ?? options?.representativeApr ?? 12.99;
  const termMonths = selectedOffer?.termMonths ?? options?.representativeTermMonths ?? 120;
  const monthlyPayment = calculateMonthlyPayment(customAmount, apr, termMonths);
  const disclosure = selectedOffer?.lenderDisclosure || options?.representativeDisclosure || BASE_DISCLOSURE;

  async function submitConsumer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await createFinancingApplication({
        ...consumer,
        amount: customAmount,
        consent: true,
      });
      window.location.assign(result.redirectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The lender application could not be started.");
    } finally { setBusy(false); }
  }

  async function submitLease(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await createLeaseApplication({ ...lease, amount: customAmount, consent: true });
      setMessage(`${result.message} Reference: ${result.reference}`);
      setLease({ firstName: "", lastName: "", email: "", company: "", consent: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your leasing inquiry.");
    } finally { setBusy(false); }
  }

  const rootClass = `rounded-xl border border-[--color-border] bg-white ${compact ? "p-4" : "p-5"}`;
  return (
    <section className={rootClass} aria-labelledby="payment-calculator-title">
      <h3 id="payment-calculator-title" className="font-semibold">{title}</h3>
      {amount <= 0 ? <p className="mt-2 text-sm text-[--color-text-muted]">Enter a purchase amount to see an estimate.</p> : (
        <>
          <label className="mt-3 block text-sm">
            Purchase amount (USD)
            <input aria-label="Purchase amount in dollars" type="number" min="1" step="0.01" value={customAmount} onChange={(event) => setCustomAmountState({ sourceAmount: amount, value: Math.max(0, Number(event.target.value)) })} className="mt-1 w-full rounded-md border border-[--color-border] px-3 py-2" />
          </label>
          <label className="mt-3 block text-sm">
            Financing term
            <select value={offerId} onChange={(event) => setOfferId(event.target.value)} className="mt-1 w-full rounded-md border border-[--color-border] bg-white px-3 py-2">
              <option value="">Representative estimate — {termMonths} months at {apr}% APR</option>
              {offers.map((offer) => <option key={offer._id} value={offer._id}>{offer.name} — {offer.termMonths} months at {offer.apr}% APR</option>)}
            </select>
          </label>
          <p className="mt-3 text-2xl font-bold">{formatCurrency(monthlyPayment, "USD", "USD", locale)}<span className="text-sm font-normal text-[--color-text-muted]"> / month estimated</span></p>
          <p className="mt-1 text-xs leading-relaxed text-[--color-text-muted]">{disclosure}</p>
          {selectedOffer?.offerType === "deferred_interest" && (
            <p className="mt-2 text-xs font-medium text-amber-800">Deferred-interest offers may accrue interest that is charged retroactively if the promotional balance is not paid in full by the offer end date. Review the lender disclosure before applying.</p>
          )}
          {optionsError && <p role="status" className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-900">Financing provider temporarily unavailable. The payment estimate remains available; contact our team for application assistance.</p>}
          {!optionsError && options && !options.applicationAvailable && <p role="status" className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-900">Online lender applications are not configured right now. The payment estimate remains available; contact our team for financing information.</p>}
          {application && <p role="status" className="mt-3 rounded bg-blue-50 p-3 text-sm text-blue-900">
            Lender application status: <strong>{application.status.replaceAll("_", " ")}</strong>
            {application.status === "approved" && application.approvedAmount != null && (
              <span> · Approved amount {formatCurrency(application.approvedAmount, "USD", "USD", locale)}{application.approvedAmount >= amount ? " covers this displayed amount" : " is below this displayed amount"}</span>
            )}
          </p>}
          {options?.applicationAvailable && <button type="button" onClick={() => { setConsumerOpen((open) => !open); setError(""); }} className="mt-3 w-full rounded-lg border border-[--color-brand-primary] px-4 py-2 text-sm font-semibold text-[--color-brand-primary]">{consumerOpen ? "Close application" : "Check prequalification"}</button>}
          {consumerOpen && options?.applicationAvailable && (
            <form onSubmit={submitConsumer} className="mt-3 space-y-3 border-t pt-3">
              <p className="text-sm text-[--color-text-muted]">Your details are stored as an application lead, then you continue to the lender’s hosted application. The lender will provide its credit-check and consent disclosures before any check.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">First name<input required maxLength={100} value={consumer.firstName} onChange={(event) => setConsumer((value) => ({ ...value, firstName: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
                <label className="text-sm">Last name<input required maxLength={100} value={consumer.lastName} onChange={(event) => setConsumer((value) => ({ ...value, lastName: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
              </div>
              <label className="block text-sm">Email<input required type="email" maxLength={254} value={consumer.email} onChange={(event) => setConsumer((value) => ({ ...value, email: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
              <label className="flex items-start gap-2 text-xs leading-relaxed"><input required type="checkbox" checked={consumer.consent} onChange={(event) => setConsumer((value) => ({ ...value, consent: event.target.checked }))} className="mt-0.5" /><span>I authorize Shadesology to send my name, email, and requested amount to the financing provider so I can continue its application. Credit eligibility and terms are determined by the lender.</span></label>
              <button disabled={busy} className="w-full rounded-lg bg-[--color-brand-primary] px-4 py-2 font-semibold text-white disabled:opacity-50">{busy ? "Connecting…" : "Continue to lender"}</button>
            </form>
          )}
        </>
      )}
      {showLeaseInquiry && (
        <details className="mt-4 border-t pt-3" open={leaseOpen} onToggle={(event) => setLeaseOpen(event.currentTarget.open)}>
          <summary className="cursor-pointer text-sm font-semibold">Commercial leasing inquiry</summary>
          <form onSubmit={submitLease} className="mt-3 space-y-3">
            <p className="text-xs text-[--color-text-muted]">Submit your contact details and our commercial team will follow up. This inquiry is not a credit application or lease offer.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">First name<input required maxLength={100} value={lease.firstName} onChange={(event) => setLease((value) => ({ ...value, firstName: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
              <label className="text-sm">Last name<input required maxLength={100} value={lease.lastName} onChange={(event) => setLease((value) => ({ ...value, lastName: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
            </div>
            <label className="block text-sm">Company<input required maxLength={200} value={lease.company} onChange={(event) => setLease((value) => ({ ...value, company: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label className="block text-sm">Work email<input required type="email" maxLength={254} value={lease.email} onChange={(event) => setLease((value) => ({ ...value, email: event.target.value }))} className="mt-1 w-full rounded border px-3 py-2" /></label>
            <label className="flex items-start gap-2 text-xs"><input required type="checkbox" checked={lease.consent} onChange={(event) => setLease((value) => ({ ...value, consent: event.target.checked }))} className="mt-0.5" /><span>I agree that Shadesology may contact me about this commercial lease inquiry.</span></label>
            <button disabled={busy} className="w-full rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">{busy ? "Submitting…" : "Request lease information"}</button>
          </form>
        </details>
      )}
      {error && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {message && <p role="status" className="mt-3 rounded bg-green-50 p-3 text-sm text-green-800">{message}</p>}
      <p className="mt-3 text-xs text-[--color-text-muted]">Final payment, taxes, shipping, and lender terms may differ. Financing is subject to lender approval and is not guaranteed by Shadesology.</p>
    </section>
  );
}
