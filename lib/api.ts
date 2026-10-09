/**
 * API client — all calls go through this module.
 * Base URL is read from NEXT_PUBLIC_API_URL (default: http://localhost:5000).
 */

import type { SerializedEditorState } from "lexical";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.data as T;
}

// ─── Types (mirroring backend shape) ─────────────────────────────────────

export interface TranslatableField {
  en: string;
  es?: string;
  de?: string;
  fr?: string;
  it?: string;
  pt?: string;
}

export type T = TranslatableField;

export function t(
  field: T | string | undefined | null,
  locale: keyof TranslatableField = "en",
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field[locale] || field.en || "";
}

// ─── Homepage ─────────────────────────────────────────────────────────────

export interface HomepageSection {
  _id: string;
  type:
    | "hero"
    | "product_overview"
    | "segments_grid"
    | "featured_products"
    | "featured_projects"
    | "trust_band"
    | "installer_locator"
    | "rich_content"
    | "custom_html";
  adminLabel: string;
  headline?: T;
  subheadline?: T;
  cta1?: { label: T; url: string; style: string };
  cta2?: { label: T; url: string; style: string };
  backgroundImage?: { url: string; alt: T; mobileUrl: string };
  backgroundVideoUrl?: string;
  featuredProducts?: ProductCard[];
  itemLimit?: number;
  trustItems?: { icon: string; label: T; value: T; sortOrder: number }[];
  content?: T;
  payloadRichText?: Partial<Record<keyof TranslatableField, SerializedEditorState>>;
  sectionTitle?: T;
  sectionSubtitle?: T;
  sortOrder: number;
  isActive: boolean;
  backgroundColor?: string;
  paddingVariant?: "sm" | "md" | "lg" | "none";
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  return apiFetch<HomepageSection[]>("/api/homepage");
}

// ─── Phase 3: inspiration, projects and videos ─────────────────────────────

export interface Phase3Project {
  _id: string;
  title: T;
  slug: string;
  description?: T;
  location: { city?: string; state?: string; country?: string };
  areaSqFt?: number | null;
  installerName?: string;
  installerProfileUrl?: string;
  segments: { _id: string; name: T; slug: string; audience?: "residential" | "commercial" | "" }[];
  products: { _id: string; name: T; slug: string; images: { url: string; alt: T }[] }[];
  gallery: { url: string; alt: T; isBefore: boolean; isAfter: boolean; sortOrder: number }[];
  challenge?: T;
  solution?: T;
  budget?: T;
  results?: T;
  energySavings?: T;
  metrics: { label: T; value: string; unit: string }[];
  isFeatured: boolean;
  completedAt?: string | null;
  updatedAt?: string | null;
  metaTitle?: T;
  metaDescription?: T;
}

export interface InspirationItem {
  _id: string;
  title: T;
  slug: string;
  image: { url: string; alt: T; width?: number | null; height?: number | null };
  alt: T;
  style: string;
  productType: { name: T; slug: string } | null;
  setting: string;
  color: string;
  manufacturer: { name: T; slug: string } | null;
  products: { _id: string; name: T; slug: string }[];
  project: { title: T; slug: string } | null;
}

export interface HostedVideo {
  _id: string;
  videoUrl: string;
  title: T;
  description?: T;
  category: string;
  thumbnail?: { url: string; alt: T } | null;
  products: { _id: string; name: T; slug: string }[];
  chapters: { title: string; seconds: number }[];
  transcript?: T;
  captionsUrl?: string;
  sortOrder?: number;
  createdAt?: string;
}

export async function getInspirationItems(params?: Record<string, string>): Promise<InspirationItem[]> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return apiFetch<InspirationItem[]>(`/api/inspiration${query}`);
}

export async function getProjects(params?: Record<string, string>): Promise<Phase3Project[]> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return apiFetch<Phase3Project[]>(`/api/projects${query}`);
}

export async function getProject(slug: string): Promise<Phase3Project> {
  return apiFetch<Phase3Project>(`/api/projects/${encodeURIComponent(slug)}`);
}

export async function getVideos(params?: Record<string, string>): Promise<HostedVideo[]> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return apiFetch<HostedVideo[]>(`/api/videos${query}`);
}

export async function getVideo(id: string): Promise<HostedVideo> {
  return apiFetch<HostedVideo>(`/api/videos/${encodeURIComponent(id)}`);
}

// ─── Categories ──────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  name: T;
  slug: string;
  description?: T;
  metaTitle?: T;
  metaDescription?: T;
  image?: { url: string; alt: T };
  sortOrder: number;
  productTypes?: { _id: string; name: T; slug: string; code: string }[];
}

export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export interface FacetOption {
  value: string;
  label: T;
  count?: number;
}

export interface Facet {
  key: string;
  label: T;
  type: "checkbox" | "button_group" | "range_slider" | "color_swatch";
  displayType?: string;
  options: FacetOption[];
  isActive?: boolean;
  unit?: string;
}

export interface CategoryPageData {
  category: Category;
  content: {
    introHeading?: T;
    introContent?: T;
    outroHeading?: T;
    outroContent?: T;
  } | null;
  products: ProductCard[];
  facets: Facet[];
  activeFilters: Record<string, string | string[]>;
  sort: string;
  seo: { canonical: string; noindex: boolean };
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function getCategoryPage(
  slug: string,
  params?: Record<string, string>,
): Promise<CategoryPageData> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<CategoryPageData>(`/api/categories/${slug}${qs}`);
}

// ─── Products ─────────────────────────────────────────────────────────────

export interface ProductCard {
  _id: string;
  name: T;
  slug: string;
  shortDescription?: T;
  images?: { url: string; alt: T; type: string }[];
  showPrice?: boolean;
  priceFrom?: number | null;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  productType?: { name: T; slug: string };
  category?: { name: T; slug: string };
}

export interface Variant {
  _id: string;
  name: T;
  sku: string;
  basePrice: number;
  displayPrice: number | null;
  priceType: "retail" | "dealer" | "quote";
  widthMin?: number;
  widthMax?: number;
  projectionMin?: number;
  projectionMax?: number;
  leadTimeDays?: number;
  leadTimeNote?: T;
  availability: "in_stock" | "made_to_order" | "discontinued" | "coming_soon";
  isDefault?: boolean;
}

export interface ProductDetail {
  product: {
    _id: string;
    name: T;
    slug: string;
    shortDescription?: T;
    description?: T;
    features?: { text: T }[];
    images?: { url: string; alt: T; type: string; sortOrder: number }[];
    videoUrl?: string;
    videos?: HostedVideo[];
    spinImages?: string[];
    fabrics?: {
      _id: string;
      name: T;
      brand?: string;
      opennessFactor?: number;
      warrantyYears?: number;
      images?: { url: string }[];
      sampleAvailable?: boolean;
    }[];
    colors?: {
      _id: string;
      name: T;
      code?: string;
      hexValue?: string;
      swatchImage?: string;
      finish?: string;
      hasSurcharge?: boolean;
    }[];
    relatedProducts?: ProductCard[];
    accessories?: {
      _id: string;
      name: T;
      slug: string;
      images?: { url: string }[];
      basePrice?: number;
    }[];
    metaTitle?: T;
    metaDescription?: T;
    showPrice?: boolean;
    isFeatured?: boolean;
    category?: { name: T; slug: string };
    productType?: {
      name: T;
      slug: string;
      code: string;
      activeModules?: string[];
    };
    manufacturer?: { name: T; slug: string; logo?: string };
    segments?: { name: T; slug: string }[];
  };
  variants: Variant[];
  moduleVisibility: Record<string, boolean>;
  content: {
    specNotes?: string;
    operationOverview?: string;
    motorBrands?: string[];
    motorNotes?: string;
    frameOverview?: string;
    frameFeatures?: string[];
    fabricOverview?: string;
    valanceOptions?: string;
    threadColors?: string;
    fabricNotes?: string;
    heatSealingDescription?: string;
    heatSealingImageUrl?: string;
    installationTypes?: string[];
    warrantyOverview?: string;
    warrantyTiers?: { label: string; years: number; notes: string }[];
    warrantyPdfUrl?: string;
    financingNote?: string;
    productIntro?: string;
  } | null;
  faqs: { _id: string; question: T; answer: T; sortOrder: number }[];
  manuals: {
    _id: string;
    title: T;
    type: string;
    currentVersion?: string;
    fileUrl: string;
    fileSizeBytes?: number;
    gating: string;
    downloadCount: number;
    effectiveDate?: string;
  }[];
  relatedProducts: ProductCard[];
  reviews: {
    summary: { count: number; averageRating: number | null };
    recent: {
      _id: string;
      rating: number;
      displayName: string;
      body: string;
      createdAt: string;
      isVerifiedPurchase: boolean;
    }[];
  };
  breadcrumbs: { name: string; url: string | null }[];
  jsonLd: { product: object; breadcrumb: object };
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/api/products/${slug}`);
}

export interface ProductComparison {
  items: {
    variantId: string;
    variantName: T;
    sku: string;
    availability: string;
    leadTimeDays?: number;
    displayPrice: number | null;
    priceType: "retail" | "dealer" | "quote";
    product: {
      _id: string;
      name: T;
      slug: string;
      image?: { url: string; alt?: T } | null;
      category?: { name: T; slug: string };
      productType?: { name: T; slug: string };
      manufacturer?: { name: T; slug: string };
    };
  }[];
  rows: {
    key: string;
    label: T;
    unit?: string | null;
    values: (string | number | boolean | null)[];
    hasDifference: boolean;
  }[];
  isCrossCategory: boolean;
}

export async function compareVariants(ids: string[]): Promise<ProductComparison> {
  const query = new URLSearchParams({ ids: ids.join(",") });
  return apiFetch<ProductComparison>(`/api/compare?${query}`);
}

export async function listProducts(params?: Record<string, string>): Promise<{
  products: ProductCard[];
  pagination: { page: number; limit: number; total: number; pages: number };
}> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`${BASE}/api/products${qs}`, {
    credentials: "include",
    next: { revalidate: 60 },
  });
  const json = await res.json();
  return { products: json.data, pagination: json.pagination };
}

// ─── Segments ────────────────────────────────────────────────────────────

export interface SegmentCard {
  _id: string;
  slug: string;
  name: T;
  audience: "residential" | "commercial";
  description?: T;
  heroImage?: { url: string; alt: T };
  icon?: string;
  sortOrder: number;
}

export interface SegmentPage {
  segment: SegmentCard;
  slug: string;
  heroHeadline: T;
  heroSubheadline?: T;
  heroImageUrl?: string;
  heroImageAlt?: T;
  heroCta?: { label: T; url: string };
  contentBlocks?: {
    type: string;
    content: T;
    sortOrder: number;
    isActive: boolean;
  }[];
  featuredProducts?: ProductCard[];
  enquiryQueue?: "consumer" | "commercial";
  relatedSegments?: SegmentCard[];
  metaTitle?: T;
  metaDescription?: T;
}

export async function getSegments(): Promise<SegmentCard[]> {
  return apiFetch<SegmentCard[]>("/api/segments/cards");
}

export async function getSegmentPage(slug: string): Promise<SegmentPage> {
  return apiFetch<SegmentPage>(`/api/segments/${slug}`);
}

// ─── Navigation ──────────────────────────────────────────────────────────

export interface NavItem {
  label: T;
  url: string;
  type: "mega" | "dropdown" | "link";
  autoCatalog?: boolean;
  children?: NavColumn[];
  ctas?: { label: T; url: string; style: string }[];
  isActive: boolean;
  sortOrder: number;
}

export interface NavColumn {
  heading?: T;
  url: string;
  image?: { url: string; alt: T };
  children?: { label: T; url: string; isActive: boolean; sortOrder: number }[];
  isActive: boolean;
  sortOrder: number;
}

export interface NavMenuData {
  type: string;
  items: NavItem[];
}

export async function getMainNav(): Promise<NavMenuData> {
  return apiFetch<NavMenuData>("/api/nav/main");
}

// ─── Footer ──────────────────────────────────────────────────────────────

export interface FooterData {
  linkGroups: {
    _id: string;
    heading: T;
    links: { label: T; url: string; isExternal: boolean; isActive: boolean }[];
    isActive: boolean;
    sortOrder: number;
  }[];
  phone: string;
  email: string;
  address?: T;
  socialLinks: { platform: string; url: string; isActive: boolean; sortOrder?: number }[];
  instagramFeed?: { imageUrl: string; imageAlt: string; permalink: string; caption?: string; sortOrder?: number }[];
  newsletterHeading?: T;
  newsletterSubheading?: T;
  newsletterEnabled?: boolean;
  copyrightText?: T;
  legalLinks?: { label: T; url: string }[];
  locations?: {
    name?: string;
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    phone?: string;
  }[];
}

export async function getFooter(): Promise<FooterData> {
  return apiFetch<FooterData>("/api/footer");
}

// ─── Search ───────────────────────────────────────────────────────────────

export interface SearchTypeaheadResult {
  products: { _id: string; name: T; slug: string; images?: { url: string }[] }[];
  categories: { _id: string; name: T; slug: string }[];
}

export async function searchTypeahead(
  q: string,
): Promise<SearchTypeaheadResult> {
  return apiFetch<SearchTypeaheadResult>(
    `/api/search/typeahead?q=${encodeURIComponent(q)}`,
  );
}

export interface SearchResult {
  products: ProductCard[];
  categories: Category[];
  content: { _id: string; title: T; slug: string; type: string }[];
  totals: { products: number; categories: number; content: number };
  pagination: { page: number; limit: number; total: number; pages: number };
}

export async function search(
  q: string,
  params?: Record<string, string>,
): Promise<SearchResult> {
  const p = new URLSearchParams({ q, ...params });
  return apiFetch<SearchResult>(`/api/search?${p}`);
}

export async function getNotFoundCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/search/not-found");
}

// ─── Newsletter ───────────────────────────────────────────────────────────

export async function subscribeNewsletter(email: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/content/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to subscribe");
  return json;
}

// ─── Legal pages ──────────────────────────────────────────────────────────

export interface LegalPage {
  _id: string;
  key: string;
  slug: string;
  title: T;
  content: T;
  metaTitle?: T;
  metaDescription?: T;
  noindex?: boolean;
  lastReviewedAt?: string;
}

export async function getLegalPage(slug: string): Promise<LegalPage> {
  return apiFetch<LegalPage>(`/api/content/pages/${slug}`);
}

export async function getSitemap(): Promise<{
  static: { url: string; label: string; images?: { url: string; title: string }[] }[];
  categories: { url: string; label: string; slug: string; translations?: string[] }[];
  products: {
    url: string;
    label: string;
    slug: string;
    translations?: string[];
    images?: { url: string; title: string }[];
    video?: { url: string; title: string; description: string; thumbnailUrl?: string } | null;
  }[];
  segments: { url: string; label: string; slug: string; translations?: string[] }[];
  legal: { url: string; label: string; slug: string; translations?: string[] }[];
  projects: {
    url: string;
    label: string;
    images?: { url: string; title: string }[];
  }[];
  videos: {
    url: string;
    label: string;
    video?: { url: string; title: string; description: string; thumbnailUrl?: string } | null;
  }[];
}> {
  return apiFetch("/api/content/sitemap");
}

export interface CommercialAttachment {
  s3Key: string;
  filename: string;
}

export async function uploadCommercialDrawing(file: File): Promise<CommercialAttachment> {
  const request = await fetch(`${BASE}/api/content/commercial/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      sizeBytes: file.size,
    }),
  });
  const upload = await request.json();
  if (!request.ok) throw new Error(upload.message || "Could not prepare the project file upload.");

  const form = new FormData();
  Object.entries(upload.data.fields as Record<string, string>).forEach(([key, value]) => form.append(key, value));
  form.append("file", file);
  const uploaded = await fetch(upload.data.uploadUrl as string, { method: "POST", body: form });
  if (!uploaded.ok) throw new Error(`Project file upload failed (${uploaded.status}).`);

  return { s3Key: upload.data.key as string, filename: file.name };
}

export async function submitCommercialEnquiry(data: {
  email: string;
  phone: string;
  company: string;
  region: string;
  message: string;
  productType: string;
  data: Record<string, string>;
  attachments: CommercialAttachment[];
}): Promise<{ reference: string }> {
  const response = await fetch(`${BASE}/api/content/commercial/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.message || "Could not submit your project enquiry.");
  return body.data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "customer" | "installer" | "specifier" | "dealer" | "staff";
  staffRole?: string;
  isEmailVerified: boolean;
  pricingGroup?: string;
  locale?: string;
  units?: "imperial" | "metric";
  company?: { _id: string; name: string; type: string; pricingGroup?: string };
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json.user as AuthUser;
}

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<{ message: string; _devVerifyToken?: string }> {
  const res = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function logoutUser(): Promise<void> {
  await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${BASE}/api/auth/me`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.user as AuthUser;
  } catch {
    return null;
  }
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/auth/reset-password/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Reset failed");
  return json;
}

export async function verifyEmail(token: string): Promise<{ message: string; user: AuthUser }> {
  const res = await fetch(`${BASE}/api/auth/verify-email/${token}`, {
    method: "GET",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Verification failed");
  return json;
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export async function updateProfile(data: Partial<{
  firstName: string;
  lastName: string;
  phone: string;
  locale: string;
  units: "imperial" | "metric";
}>): Promise<AuthUser> {
  const res = await fetch(`${BASE}/api/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Update failed");
  return json.user as AuthUser;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/api/auth/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to change password");
  return json;
}
