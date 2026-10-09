import { Suspense } from "react";
import { PrivacyCenter } from "./PrivacyCenter";

export const metadata = {
  title: "Privacy choices and requests | Shadesology",
  description: "Manage optional cookies, request a copy of your data, request deletion, or opt out of data sharing.",
};

export default function PrivacyPage() {
  return (
    <article className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold">Privacy choices</h1>
      <p className="mt-4 text-[--color-text-muted]">
        We use necessary data to provide requested services, protect accounts, and complete purchases.
        Optional analytics and marketing technologies are disabled unless you opt in through the cookie controls.
        We do not load HubSpot tracking scripts or embedded HubSpot forms on this site.
      </p>
      <p className="mt-3">
        You can request access to your personal information, request deletion, or opt out of sale/sharing for targeted advertising.
        We verify requests by email. Order records may be retained in anonymized form where needed for transaction, tax, fraud,
        or warranty obligations.
      </p>
      <Suspense fallback={<p className="mt-8">Loading privacy request form…</p>}>
        <PrivacyCenter />
      </Suspense>
      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">State privacy law readiness</h2>
        <p>Our operational checklist and owner actions are documented in the internal privacy readiness checklist.</p>
      </section>
    </article>
  );
}
