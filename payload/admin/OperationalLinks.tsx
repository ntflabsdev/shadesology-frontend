import Link from "next/link";

const operationalPages = [
  ["Orders", "/admin/orders"],
  ["Quotes", "/admin/quotes"],
  ["Leads", "/admin/leads"],
  ["Installers", "/admin/installers"],
  ["CRM", "/admin/crm"],
];

export function OperationalLinks() {
  return (
    <section className="payload-operational-links">
      <h2>Operational workspaces</h2>
      <nav aria-label="Operational workspaces">
        {operationalPages.map(([label, href]) => (
          <Link href={href} key={href}>{label}</Link>
        ))}
      </nav>
    </section>
  );
}
