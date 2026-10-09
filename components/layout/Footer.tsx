"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FooterData, t, subscribeNewsletter } from "@/lib/api";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
    </svg>
  ),
  houzz: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M12.5 0L0 7.011V24h8V15.5h9V24h7V7.011L12.5 0z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
};

function NewsletterForm({ heading, subheading }: { heading?: string; subheading?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    try {
      await subscribeNewsletter(email);
      setState("success");
      setMessage("Thanks for subscribing!");
      setEmail("");
    } catch {
      setState("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      {heading && <h3 className="text-base font-semibold text-white mb-1">{heading}</h3>}
      {subheading && <p className="text-sm text-[--color-neutral-400] mb-3">{subheading}</p>}
      {state === "success" ? (
        <p className="text-sm text-[--color-brand-accent] font-medium">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[--color-neutral-800] border border-[--color-neutral-700] text-white placeholder-[--color-neutral-400] text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
            aria-label="Email address for newsletter"
          />
          <button
            type="submit"
            disabled={state === "loading"}
            className="px-4 py-2 rounded-lg bg-[--color-brand-accent] text-[--color-neutral-900] text-sm font-semibold hover:bg-[--color-brand-accent-dark] transition-colors disabled:opacity-60"
          >
            {state === "loading" ? "…" : "Subscribe"}
          </button>
        </form>
      )}
      {state === "error" && (
        <p className="mt-1.5 text-xs text-red-400" role="alert">{message}</p>
      )}
    </div>
  );
}

interface Props {
  footer: FooterData | null;
}

export function Footer({ footer }: Props) {
  const { locale } = useLocaleSettings();
  const activeGroups = (footer?.linkGroups ?? [])
    .filter((g) => g.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const activeSocial = (footer?.socialLinks ?? [])
    .filter((s) => s.isActive)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <footer className="bg-[--color-neutral-900] text-[--color-neutral-300]" role="contentinfo">
      <div className="container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand col */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white" aria-label="Shadesology home">
              <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
                <rect x="0" y="8" width="32" height="4" rx="2" fill="#D4A853" />
                <rect x="4" y="14" width="24" height="3" rx="1.5" fill="#2D6A4F" />
                <rect x="8" y="18" width="16" height="3" rx="1.5" fill="#ffffff" />
              </svg>
              Shadesology
            </Link>
            <div className="space-y-1 text-sm">
              {footer?.phone && (
                <p>
                  <a href={`tel:${footer.phone.replace(/\D/g, "")}`} className="hover:text-white transition-colors">
                    📞 {footer.phone}
                  </a>
                </p>
              )}
              {footer?.email && (
                <p>
                  <a href={`mailto:${footer.email}`} className="hover:text-white transition-colors">
                    ✉ {footer.email}
                  </a>
                </p>
              )}
              {footer?.address && <p>{t(footer.address, locale)}</p>}
            </div>

            {/* Social links */}
            {activeSocial.length > 0 && (
              <nav className="flex gap-3" aria-label="Social media">
                {activeSocial.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[--color-neutral-400] hover:text-white transition-colors"
                    aria-label={s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                  >
                    {SOCIAL_ICONS[s.platform] ?? s.platform}
                  </a>
                ))}
              </nav>
            )}

            {(footer?.instagramFeed?.length ?? 0) > 0 && (
              <section aria-labelledby="instagram-feed-heading">
                <h3 id="instagram-feed-heading" className="mb-3 text-sm font-semibold text-white">From Instagram</h3>
                <ul className="grid grid-cols-4 gap-2">
                  {footer?.instagramFeed?.slice(0, 12).map((item, index) => (
                    <li key={`${item.permalink}-${index}`}>
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.caption || item.imageAlt}
                        className="block overflow-hidden rounded-md"
                      >
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt}
                          width={96}
                          height={96}
                          unoptimized
                          className="aspect-square w-full object-cover transition-transform hover:scale-105"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Newsletter */}
            {footer?.newsletterEnabled && (
              <NewsletterForm
                heading={footer.newsletterHeading ? t(footer.newsletterHeading, locale) : undefined}
                subheading={footer.newsletterSubheading ? t(footer.newsletterSubheading, locale) : undefined}
              />
            )}
          </div>

          {/* Link groups */}
          {activeGroups.map((group) => (
            <div key={group._id}>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {t(group.heading, locale)}
              </h3>
              <ul className="space-y-2">
                {group.links
                  .filter((l) => l.isActive)
                  .map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.url}
                        className="text-sm hover:text-white transition-colors"
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                      >
                        {t(link.label, locale)}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Multiple locations row */}
      {footer?.locations && footer.locations.length > 1 && (
        <div className="border-t border-[--color-neutral-800]">
          <div className="container py-8">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Our Locations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {footer.locations.map((loc, i) => (
                <address key={i} className="text-sm text-[--color-neutral-400] not-italic leading-relaxed">
                  {loc.name && (
                    <span className="block font-semibold text-white mb-1">{loc.name}</span>
                  )}
                  {loc.line1 && <span className="block">{loc.line1}</span>}
                  {(loc.city || loc.state) && (
                    <span className="block">
                      {[loc.city, loc.state, loc.zip].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {loc.phone && (
                    <a href={`tel:${loc.phone.replace(/\D/g, "")}`} className="block hover:text-white transition-colors mt-0.5">
                      {loc.phone}
                    </a>
                  )}
                </address>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <div className="border-t border-[--color-neutral-800]">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[--color-neutral-500]">
          <p>{footer?.copyrightText ? t(footer.copyrightText, locale) : `© ${new Date().getFullYear()} Shadesology. All rights reserved.`}</p>
          <nav aria-label="Legal links" className="flex flex-wrap justify-center gap-4">
            {footer?.legalLinks?.map((link, i) => (
              <Link key={i} href={link.url} className="hover:text-[--color-neutral-300] transition-colors">
                {t(link.label, locale)}
              </Link>
            ))}
            <Link href="/privacy" className="hover:text-[--color-neutral-300] transition-colors">Privacy choices</Link>
            <Link href="/accessibility" className="hover:text-[--color-neutral-300] transition-colors">Accessibility</Link>
            <button
              type="button"
              className="hover:text-[--color-neutral-300] transition-colors"
              onClick={() => window.dispatchEvent(new CustomEvent("privacy:open-settings"))}
            >
              Cookie settings
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}
