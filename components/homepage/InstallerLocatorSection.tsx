"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { HomepageSection, t } from "@/lib/api";
import Link from "next/link";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";

interface Props {
  section: HomepageSection;
}

export function InstallerLocatorSection({ section }: Props) {
  const { locale } = useLocaleSettings();
  const [postcode, setPostcode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (postcode.trim()) {
      router.push(`/find-installer?postcode=${encodeURIComponent(postcode.trim())}`);
    }
  }

  return (
    <section
      className="section bg-[--color-surface-alt]"
      aria-labelledby="installer-heading"
    >
      <div className="container max-w-2xl text-center">
        <h2
          id="installer-heading"
          className="text-3xl md:text-4xl font-bold text-[--color-text-primary] mb-3"
        >
          {t(section.sectionTitle, locale) || "Find a Local Installer"}
        </h2>
        {section.sectionSubtitle && (
          <p className="text-lg text-[--color-text-muted] mb-8">
            {t(section.sectionSubtitle, locale)}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-6"
          role="search"
          aria-label="Find installer by postcode"
        >
          <label htmlFor="installer-postcode" className="sr-only">
            Your postcode
          </label>
          <input
            id="installer-postcode"
            type="text"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Enter your postcode"
            className="flex-1 px-4 py-3 rounded-xl border border-[--color-border] text-[--color-text-primary] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent]"
            aria-label="Postcode"
            autoComplete="postal-code"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[--color-brand-primary] text-white font-semibold hover:bg-[--color-brand-primary-light] transition-colors"
          >
            {section.cta1 ? t(section.cta1.label, locale) : "Find Installer"}
          </button>
        </form>

        {section.cta2 && (
          <p className="text-sm text-[--color-text-muted]">
            No installer in your area?{" "}
            <Link
              href={section.cta2.url}
              className="font-semibold text-[--color-brand-primary] hover:underline"
            >
              {t(section.cta2.label, locale)}
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
