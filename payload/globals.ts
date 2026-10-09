import type { GlobalConfig } from "payload";
import { publishedOrStaff, staffRoles } from "./access";

const localizedText = (name: string, label?: string) => ({
  name,
  type: "text" as const,
  label,
  localized: true,
});

const localizedTextarea = (name: string, label?: string) => ({
  name,
  type: "textarea" as const,
  label,
  localized: true,
});

const globalAccess = {
  read: publishedOrStaff,
  update: staffRoles("admin", "content"),
};

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  access: globalAccess,
  versions: { drafts: { autosave: true }, max: 25 },
  fields: [
    {
      name: "sections",
      type: "blocks",
      blocks: [
        {
          slug: "hero",
          labels: { singular: "Hero", plural: "Hero sections" },
          fields: [
            { name: "enabled", type: "checkbox", defaultValue: true },
            localizedText("headline", "Headline"),
            localizedTextarea("subheadline", "Subheadline"),
            { name: "primaryCta", type: "group", fields: [localizedText("label"), { name: "url", type: "text" }] },
            { name: "secondaryCta", type: "group", fields: [localizedText("label"), { name: "url", type: "text" }] },
            { name: "image", type: "upload", relationTo: "media" },
            { name: "mobileImage", type: "upload", relationTo: "media" },
            { name: "legacyImageUrl", type: "text", admin: { description: "Temporary migrated URL; replace with an uploaded public media asset." } },
            { name: "legacyMobileImageUrl", type: "text", admin: { description: "Temporary migrated URL; replace with an uploaded public media asset." } },
            localizedTextarea("imageAlt", "Image alt text"),
            { name: "backgroundVideoUrl", type: "text" },
            { name: "backgroundColor", type: "text" },
            { name: "paddingVariant", type: "select", defaultValue: "md", options: ["sm", "md", "lg", "none"] },
          ],
        },
        {
          slug: "product-overview",
          labels: { singular: "Product overview", plural: "Product overviews" },
          fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, localizedText("heading"), localizedTextarea("intro"), { name: "itemLimit", type: "number", defaultValue: 9, min: 1, max: 18 }],
        },
        {
          slug: "segments-grid",
          labels: { singular: "Market segments", plural: "Market segment grids" },
          fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, localizedText("heading"), localizedTextarea("intro"), { name: "segments", type: "relationship", relationTo: "segments", hasMany: true }],
        },
        {
          slug: "featured-products",
          labels: { singular: "Featured products", plural: "Featured product sections" },
          fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, localizedText("heading"), { name: "products", type: "relationship", relationTo: "products", hasMany: true }, { name: "itemLimit", type: "number", defaultValue: 6, min: 1, max: 12 }],
        },
        {
          slug: "featured-projects",
          labels: { singular: "Featured projects", plural: "Featured project sections" },
          fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, localizedText("heading"), { name: "projects", type: "relationship", relationTo: "projects", hasMany: true }, { name: "itemLimit", type: "number", defaultValue: 3, min: 1, max: 8 }],
        },
        {
          slug: "trust-band",
          labels: { singular: "Trust band", plural: "Trust bands" },
          fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, { name: "items", type: "array", fields: [localizedText("label"), localizedText("value"), { name: "icon", type: "text" }] }],
        },
        {
          slug: "installer-locator",
          labels: { singular: "Installer locator", plural: "Installer locator sections" },
          fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, localizedText("heading"), localizedTextarea("intro"), { name: "primaryCta", type: "group", fields: [localizedText("label"), { name: "url", type: "text" }] }],
        },
        {
          slug: "rich-content",
          labels: { singular: "Rich content", plural: "Rich content sections" },
          fields: [{ name: "enabled", type: "checkbox", defaultValue: true }, localizedText("heading"), { name: "body", type: "richText", localized: true }],
        },
      ],
      admin: { initCollapsed: true },
    },
  ],
};

export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: "Navigation",
  access: globalAccess,
  versions: { drafts: { autosave: true }, max: 25 },
  fields: [
    {
      name: "items",
      type: "array",
      admin: { description: "Product navigation is supplemented from the published catalog. Keep manual links for curated overrides." },
      fields: [
        localizedText("label", "Link label"),
        { name: "url", type: "text", required: true },
        { name: "type", type: "select", defaultValue: "link", options: ["mega", "dropdown", "link"] },
        { name: "autoCatalog", type: "checkbox", defaultValue: false },
        { name: "children", type: "array", fields: [
          localizedText("heading"),
          { name: "category", type: "relationship", relationTo: "categories" },
          { name: "url", type: "text" },
          { name: "image", type: "group", fields: [
            { name: "image", type: "upload", relationTo: "media" },
            { name: "legacyImageUrl", type: "text", admin: { description: "Temporary migrated URL; replace with an uploaded public media asset." } },
            localizedTextarea("alt", "Image alt text"),
          ] },
          { name: "children", type: "array", fields: [
            localizedText("label"),
            { name: "url", type: "text", required: true },
            { name: "icon", type: "text" },
            localizedText("badge"),
            { name: "enabled", type: "checkbox", defaultValue: true },
            { name: "sortOrder", type: "number", defaultValue: 0 },
          ] },
          { name: "enabled", type: "checkbox", defaultValue: true },
          { name: "sortOrder", type: "number", defaultValue: 0 },
        ] },
        { name: "ctas", type: "array", fields: [
          localizedText("label"),
          { name: "url", type: "text", required: true },
          { name: "style", type: "select", defaultValue: "primary", options: ["primary", "secondary", "outline"] },
        ] },
        { name: "enabled", type: "checkbox", defaultValue: true },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
    { name: "mobileItems", type: "array", fields: [
      localizedText("label"),
      { name: "url", type: "text" },
      { name: "enabled", type: "checkbox", defaultValue: true },
      { name: "sortOrder", type: "number", defaultValue: 0 },
    ] },
  ],
};

export const Footer: GlobalConfig = {
  slug: "footer",
  label: "Footer",
  access: globalAccess,
  versions: { drafts: { autosave: true }, max: 25 },
  fields: [
    {
      name: "linkGroups",
      type: "array",
      fields: [
        localizedText("heading", "Group heading"),
        { name: "links", type: "array", fields: [
          localizedText("label"),
          { name: "url", type: "text", required: true },
          { name: "isExternal", type: "checkbox", defaultValue: false },
          { name: "enabled", type: "checkbox", defaultValue: true },
          { name: "sortOrder", type: "number", defaultValue: 0 },
        ] },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    localizedTextarea("address"),
    { name: "socialLinks", type: "array", maxRows: 10, fields: [
      { name: "platform", type: "select", options: ["instagram", "pinterest", "facebook", "youtube", "linkedin", "twitter", "x", "tiktok", "houzz", "other"] },
      { name: "url", type: "text", required: true },
      { name: "enabled", type: "checkbox", defaultValue: true },
    ] },
    { name: "instagramFeed", type: "array", maxRows: 12, fields: [
      { name: "image", type: "upload", relationTo: "media" },
      { name: "imageUrl", type: "text" },
      { name: "imageAlt", type: "text", required: true },
      { name: "permalink", type: "text", required: true },
      { name: "caption", type: "textarea" },
      { name: "enabled", type: "checkbox", defaultValue: true },
    ] },
    localizedText("newsletterHeading"),
    localizedTextarea("newsletterSubheading"),
    localizedTextarea("copyright", "Copyright line"),
    { name: "legalLinks", type: "array", fields: [localizedText("label"), { name: "url", type: "text", required: true }] },
    { name: "locations", type: "array", fields: [
      { name: "name", type: "text" },
      localizedTextarea("address"),
      { name: "phone", type: "text" },
      { name: "email", type: "email" },
      { name: "mapEmbedUrl", type: "text" },
      { name: "enabled", type: "checkbox", defaultValue: true },
    ] },
    { name: "newsletterEnabled", type: "checkbox", defaultValue: true },
  ],
};

export const CmsGlobals: GlobalConfig[] = [Homepage, Navigation, Footer];
