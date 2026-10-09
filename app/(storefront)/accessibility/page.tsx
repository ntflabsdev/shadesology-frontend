import Link from "next/link";

export const metadata = {
  title: "Accessibility statement | Shadesology",
  description: "Our accessibility commitment, support options, and how to report an accessibility barrier.",
};

export default function AccessibilityPage() {
  return (
    <article className="container max-w-4xl py-12">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <Link href="/" className="underline">Home</Link><span aria-hidden="true"> / </span>
        <span aria-current="page">Accessibility</span>
      </nav>
      <h1 className="text-3xl font-bold">Accessibility statement</h1>
      <p className="mt-4 text-[--color-text-muted]">
        Shadesology is committed to making our website and shopping experience accessible to as many people as possible.
        We aim to conform to WCAG 2.1 Level AA and continue to review our pages, components, and customer journeys.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">What we are doing</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Supporting keyboard navigation, visible focus, skip navigation, and meaningful page landmarks.</li>
          <li>Providing labels and announced validation feedback for forms, and text alternatives for meaningful images.</li>
          <li>Respecting reduced-motion preferences and providing controls for user-initiated media.</li>
          <li>Running automated accessibility checks in our pull-request workflow alongside manual review.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Need help or found a barrier?</h2>
        <p>
          <Link className="font-medium underline" href="/contact">Contact our support team</Link>
          {" "}or call the support number shown in the site footer. Please include the page URL, what you were trying to do,
          and your preferred way for us to respond. Do not include payment card details or passwords.
        </p>
        <p>We will work with you to provide the information or service through an accessible alternative.</p>
      </section>

      <p className="mt-8 text-sm text-[--color-text-muted]">Statement reviewed October 2026.</p>
    </article>
  );
}
