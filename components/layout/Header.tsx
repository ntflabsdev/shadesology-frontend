"use client";

import React, { useState, useEffect, useRef, useCallback, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NavMenuData, NavItem, SearchTypeaheadResult, t, searchTypeahead } from "@/lib/api";
import { LocaleControls } from "@/components/i18n/LocaleControls";
import { useLocaleSettings } from "@/components/i18n/LocaleProvider";

interface HeaderProps {
  nav: NavMenuData | null;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/* ─── Search Bar ─────────────────────────────────────────────────────── */
function SearchBar() {
  const router = useRouter();
  const { locale } = useLocaleSettings();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchTypeaheadResult | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) return;
    let cancelled = false;
    searchTypeahead(debouncedQuery)
      .then((r) => {
        if (!cancelled) {
          setResults(r);
          setOpen(true);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm hidden lg:block">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor="site-search" className="sr-only">Search products and content</label>
        <div className="relative">
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            value={query}
            onChange={(e) => {
              const nextQuery = e.target.value;
              setQuery(nextQuery);
              if (nextQuery.trim().length < 2) {
                setResults(null);
                setOpen(false);
                setLoading(false);
              } else setLoading(true);
            }}
            placeholder="Search awnings, pergolas…"
            autoComplete="off"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[--color-border] text-sm bg-[--color-neutral-50] focus:outline-none focus:ring-2 focus:ring-[--color-brand-accent] focus:border-transparent"
            aria-label="Search"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--color-text-muted]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {loading && (
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 text-[--color-text-muted]" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
        </div>
      </form>

      {open && results && (
        <div
          id="search-suggestions"
          className="absolute top-full mt-1 left-0 right-0 bg-white border border-[--color-border] rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {results.products.length === 0 && results.categories.length === 0 ? (
            <p className="p-3 text-sm text-[--color-text-muted]">No results found</p>
          ) : (
            <>
              {results.products.length > 0 && (
                <div>
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold text-[--color-text-muted] uppercase tracking-wide">Products</p>
                  {results.products.map((p) => (
                    <Link
                      key={p._id}
                      href={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-[--color-neutral-50] text-sm"
                    >
                      {p.images?.[0] && (
                        <Image src={p.images[0].url} alt="" width={32} height={32} className="h-8 w-8 rounded object-cover" unoptimized />
                      )}
                      {t(p.name, locale)}
                    </Link>
                  ))}
                </div>
              )}
              {results.categories.length > 0 && (
                <div className="border-t border-[--color-border]">
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold text-[--color-text-muted] uppercase tracking-wide">Categories</p>
                  {results.categories.map((c) => (
                    <Link
                      key={c._id}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2 hover:bg-[--color-neutral-50] text-sm"
                    >
                      {t(c.name, locale)}
                    </Link>
                  ))}
                </div>
              )}
              <div className="border-t border-[--color-border] p-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="block text-center text-xs text-[--color-brand-primary] font-semibold py-1 hover:underline"
                >
                  See all results for: {query}
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Mega Menu Desktop ────────────────────────────────────────────────── */
function DesktopNavItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const { locale } = useLocaleSettings();
  const ref = useRef<HTMLDivElement>(null);
  const label = t(item.label, locale);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  if (item.type === "link" || !item.children?.length) {
    return (
      <Link
        href={item.url || "#"}
        className="px-3 py-2 text-sm font-medium text-[--color-text-primary] hover:text-[--color-brand-primary] transition-colors"
      >
        {label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="px-3 py-2 text-sm font-medium text-[--color-text-primary] hover:text-[--color-brand-primary] transition-colors flex items-center gap-1"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <svg className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute top-full left-0 z-40 bg-white border border-[--color-border] shadow-xl rounded-xl overflow-hidden mt-1 ${item.type === "mega" ? "w-160 max-w-3xl" : "w-56"}`}
          role="region"
          aria-label={`${label} submenu`}
        >
          {item.type === "mega" ? (
            <div className="p-5">
              <div className="grid grid-cols-3 gap-6">
                {item.children?.map((col, i) => (
                  <div key={i}>
                    {col.heading && (
                      <Link
                        href={col.url || "#"}
                        className="block text-xs font-bold uppercase tracking-wider text-[--color-brand-primary] mb-2 hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        {t(col.heading, locale)}
                      </Link>
                    )}
                    <ul className="space-y-1">
                      {col.children?.map((link, j) => (
                        <li key={j}>
                          <Link
                            href={link.url}
                            className="block text-sm text-[--color-text-primary] hover:text-[--color-brand-primary] py-0.5 transition-colors"
                            onClick={() => setOpen(false)}
                          >
                            {t(link.label, locale)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {item.ctas && item.ctas.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[--color-border] flex gap-3">
                  {item.ctas.map((cta, i) => (
                    <Link
                      key={i}
                      href={cta.url}
                      onClick={() => setOpen(false)}
                      className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                        cta.style === "primary"
                          ? "bg-[--color-brand-primary] text-white hover:bg-[--color-brand-primary-light]"
                          : "border border-[--color-brand-primary] text-[--color-brand-primary] hover:bg-[--color-brand-primary] hover:text-white"
                      }`}
                    >
                      {t(cta.label, locale)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <ul className="py-1">
              {item.children?.flatMap((col) => col.children ?? []).map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.url}
                    className="block px-4 py-2 text-sm text-[--color-text-primary] hover:bg-[--color-neutral-50] hover:text-[--color-brand-primary] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {t(link.label, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile Nav ─────────────────────────────────────────────────────── */
function MobileNav({ nav, onClose }: { nav: NavMenuData | null; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { locale } = useLocaleSettings();
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const titleId = `mobile-menu-title-${useId()}`;

  useEffect(() => {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    const closeButton = focusable()[0];
    closeButton?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [onClose]);

  return (
    <div ref={dialogRef} className="fixed inset-0 z-50 flex" aria-modal="true" role="dialog" aria-labelledby={titleId}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <nav className="relative w-80 max-w-full bg-white h-full overflow-y-auto shadow-xl flex flex-col" aria-label="Mobile navigation">
        <div className="flex items-center justify-between p-4 border-b border-[--color-border]">
          <h2 id={titleId} className="sr-only">Site menu</h2>
          <Link href="/" onClick={onClose} className="text-xl font-bold text-[--color-brand-primary]">
            Shadesology
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[--color-text-muted] hover:bg-[--color-neutral-100]"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="flex-1 p-4 space-y-1">
          {(nav?.items ?? []).map((item, i) => {
            const label = t(item.label, locale);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expanded === label;

            return (
              <li key={i}>
                {hasChildren ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[--color-text-primary] hover:bg-[--color-neutral-50] transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : label)}
                      aria-expanded={isExpanded}
                    >
                      {label}
                      <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <ul className="ml-4 mt-1 space-y-0.5 border-l-2 border-[--color-brand-primary]/20 pl-3">
                        {item.children?.flatMap((col) => col.children ?? []).map((link, j) => (
                          <li key={j}>
                            <Link
                              href={link.url}
                              onClick={onClose}
                              className="block py-2 text-sm text-[--color-text-muted] hover:text-[--color-brand-primary] transition-colors"
                            >
                              {t(link.label, locale)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.url || "#"}
                    onClick={onClose}
                    className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[--color-text-primary] hover:bg-[--color-neutral-50] hover:text-[--color-brand-primary] transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="p-4 border-t border-[--color-border] space-y-2">
          <LocaleControls />
          <Link
            href="/quote"
            onClick={onClose}
            className="block w-full text-center py-2.5 rounded-lg bg-[--color-brand-primary] text-white text-sm font-semibold hover:bg-[--color-brand-primary-light] transition-colors"
          >
            Request a Quote
          </Link>
          <a
            href="tel:18007423370"
            className="block w-full text-center py-2.5 rounded-lg border border-[--color-border] text-sm font-medium text-[--color-text-primary] hover:bg-[--color-neutral-50] transition-colors"
          >
            📞 1-800-SHADES-0
          </a>
        </div>
      </nav>
    </div>
  );
}

/* ─── Main Header ────────────────────────────────────────────────────── */
export function Header({ nav }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-30 bg-white transition-shadow duration-200 ${scrolled ? "shadow-md" : "border-b border-[--color-border]"}`}
        role="banner"
      >
        {/* Top bar */}
        <div className="bg-[--color-brand-primary] text-white text-xs py-1.5 hidden sm:block">
          <div className="container flex items-center justify-between">
            <p>Custom shade solutions — ships nationwide</p>
            <div className="flex items-center gap-4">
              <div className="hidden lg:block"><LocaleControls /></div>
            <a href="tel:18007423370" className="flex items-center gap-1 hover:text-[--color-brand-accent] transition-colors font-medium">
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              1-800-SHADES-0
            </a>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <div className="container">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 font-bold text-xl text-[--color-brand-primary]" aria-label="Shadesology home">
              <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
                <rect x="0" y="8" width="32" height="4" rx="2" fill="#1B4332" />
                <rect x="4" y="14" width="24" height="3" rx="1.5" fill="#2D6A4F" />
                <rect x="8" y="18" width="16" height="3" rx="1.5" fill="#D4A853" />
              </svg>
              Shadesology
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Main navigation">
              {(nav?.items ?? []).filter((i) => i.isActive).sort((a, b) => a.sortOrder - b.sortOrder).map((item, i) => (
                <DesktopNavItem key={i} item={item} />
              ))}
            </nav>

            {/* Search */}
            <SearchBar />

            {/* CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/quote"
                className="hidden sm:flex items-center gap-1.5 bg-[--color-brand-accent] text-[--color-neutral-900] text-sm font-bold px-4 py-2 rounded-lg hover:bg-[--color-brand-accent-dark] transition-colors"
              >
                Get a Quote
              </Link>

              {/* Cart icon */}
              <Link
                href="/cart"
                className="relative p-2 rounded-lg text-[--color-text-primary] hover:bg-[--color-neutral-100] transition-colors focus-visible:ring-2 focus-visible:ring-[--color-brand-accent] focus-visible:outline-none"
                aria-label="Shopping cart"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 8L4 5M7 13l-1 5h12M17 18a1 1 0 100 2 1 1 0 000-2M9 18a1 1 0 100 2 1 1 0 000-2" />
                </svg>
              </Link>

              {/* Account icon */}
              <Link
                href="/account"
                className="p-2 rounded-lg text-[--color-text-primary] hover:bg-[--color-neutral-100] transition-colors focus-visible:ring-2 focus-visible:ring-[--color-brand-accent] focus-visible:outline-none hidden sm:flex"
                aria-label="My account"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-[--color-text-primary] hover:bg-[--color-neutral-100] transition-colors"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && <MobileNav nav={nav} onClose={closeMobile} />}
    </>
  );
}
