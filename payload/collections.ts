import type { CollectionConfig, Field, Where } from "payload";
import { canUseAdmin, isAdmin, isStaff, publishedOrStaff, staffRoles } from "./access";

const localizedText = (name: string, label?: string): Field => ({
  name,
  type: "text",
  label,
  localized: true,
});

const localizedTextarea = (name: string, label?: string): Field => ({
  name,
  type: "textarea",
  label,
  localized: true,
});

const localizedRichText = (name: string, label?: string): Field => ({
  name,
  type: "richText",
  label,
  localized: true,
});

const slugField: Field = {
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
};

const seoFields: Field[] = [
  localizedText("metaTitle", "Meta title"),
  localizedTextarea("metaDescription", "Meta description"),
];

const editorialAccess = {
  admin: canUseAdmin,
  create: staffRoles("admin", "content"),
  read: publishedOrStaff,
  update: staffRoles("admin", "content"),
  delete: staffRoles("admin"),
};

const adminOnlyAccess = {
  admin: canUseAdmin,
  create: isAdmin,
  read: canUseAdmin,
  update: isAdmin,
  delete: isAdmin,
};

const versions = { drafts: { autosave: true }, maxPerDoc: 25 };

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "Access",
    defaultColumns: ["email", "role", "updatedAt"],
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    cookies: { sameSite: "Lax", secure: process.env.NODE_ENV === "production" },
  },
  access: {
    admin: canUseAdmin,
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "admin",
      options: [
        { label: "Administrator", value: "admin" },
        { label: "Sales", value: "sales" },
        { label: "Support", value: "support" },
        { label: "Content editor", value: "content" },
      ],
      access: { update: ({ req }) => isAdmin({ req }) },
    },
    { name: "firstName", type: "text" },
    { name: "lastName", type: "text" },
  ],
};

export const Media: CollectionConfig = {
  slug: "media",
  admin: { useAsTitle: "filename", group: "Content" },
  access: {
    admin: canUseAdmin,
    create: staffRoles("admin", "content"),
    read: () => true,
    update: staffRoles("admin", "content"),
    delete: staffRoles("admin"),
  },
  upload: {
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 900, height: 700, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
    filesRequiredOnCreate: true,
    focalPoint: true,
    resizeOptions: { width: 2400, height: 2400, fit: "inside" },
  },
  fields: [
    localizedText("alt", "Accessible alt text"),
    { name: "credit", type: "text" },
  ],
};

export const PrivateDocuments: CollectionConfig = {
  slug: "private-documents",
  admin: { useAsTitle: "filename", group: "Content" },
  access: {
    admin: canUseAdmin,
    create: staffRoles("admin", "content"),
    read: canUseAdmin,
    update: staffRoles("admin", "content"),
    delete: staffRoles("admin"),
  },
  upload: {
    mimeTypes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    staticDir: "private-documents",
    disableLocalStorage: process.env.NODE_ENV === "production",
    filesRequiredOnCreate: true,
    adminThumbnail: undefined,
    crop: false,
    focalPoint: false,
  },
  fields: [
    localizedText("title", "Document title"),
    localizedTextarea("description", "Description"),
    { name: "version", type: "text", required: true },
    { name: "effectiveDate", type: "date" },
    { name: "expiresAt", type: "date" },
    { name: "gated", type: "checkbox", defaultValue: true },
    { name: "product", type: "relationship", relationTo: "products" },
  ],
};

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "slug", group: "Catalog", defaultColumns: ["slug", "parent", "sortOrder", "_status"] },
  access: editorialAccess,
  versions,
  orderable: true,
  fields: [
    localizedText("name", "Category name"),
    slugField,
    { name: "parent", type: "relationship", relationTo: "categories" },
    { name: "depth", type: "number", defaultValue: 0 },
    { name: "path", type: "text" },
    localizedTextarea("description", "Description"),
    { name: "image", type: "upload", relationTo: "media" },
    { name: "productTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
    ...seoFields,
  ],
};

export const ProductTypes: CollectionConfig = {
  slug: "product-types",
  dbName: "producttypes",
  admin: { useAsTitle: "slug", group: "Catalog", defaultColumns: ["slug", "isActive", "_status"] },
  access: editorialAccess,
  versions,
  orderable: true,
  fields: [
    localizedText("name", "Product type"),
    slugField,
    localizedTextarea("description", "Description"),
    { name: "code", type: "text", required: true, unique: true },
    { name: "category", type: "relationship", relationTo: "categories" },
    { name: "attributes", type: "relationship", relationTo: "attribute-definitions", hasMany: true },
    {
      name: "activeModules",
      type: "select",
      hasMany: true,
      defaultValue: ["specifications", "accessories", "manuals", "faq", "warranty"],
      options: [
        "specifications",
        "operation_motorization",
        "frame_features",
        "fabric_valance_thread",
        "heat_sealing",
        "accessories",
        "installation_types",
        "manuals",
        "faq",
        "warranty",
        "financing",
        "comparison",
      ],
    },
    { name: "hasConfigurator", type: "checkbox", defaultValue: false },
    { name: "configuratorKey", type: "text" },
    { name: "icon", type: "text" },
    {
      name: "image",
      type: "group",
      fields: [
        { name: "image", type: "upload", relationTo: "media" },
        localizedTextarea("alt", "Image alt text"),
      ],
    },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
    ...seoFields,
  ],
};

export const AttributeDefinitions: CollectionConfig = {
  slug: "attribute-definitions",
  dbName: "attributedefinitions",
  admin: { useAsTitle: "key", group: "Catalog" },
  access: editorialAccess,
  versions,
  fields: [
    { name: "key", type: "text", required: true, unique: true },
    localizedText("label", "Attribute label"),
    { name: "type", type: "select", required: true, options: ["text", "number", "boolean", "select", "range"] },
    { name: "unit", type: "text" },
    { name: "options", type: "array", fields: [localizedText("label"), { name: "value", type: "text", required: true }] },
    { name: "filterable", type: "checkbox", defaultValue: false },
    { name: "comparable", type: "checkbox", defaultValue: false },
    { name: "productTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
  ],
};

export const Manufacturers: CollectionConfig = {
  slug: "manufacturers",
  admin: { useAsTitle: "slug", group: "Catalog" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("name", "Manufacturer"),
    slugField,
    localizedRichText("description", "Description"),
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "website", type: "text" },
    { name: "country", type: "text" },
    { name: "certifications", type: "array", fields: [
      { name: "name", type: "text", required: true },
      { name: "number", type: "text" },
      { name: "issuedAt", type: "date" },
      { name: "expiresAt", type: "date" },
      { name: "document", type: "upload", relationTo: "private-documents" },
    ] },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
    ...seoFields,
  ],
};

export const Segments: CollectionConfig = {
  slug: "segments",
  admin: { useAsTitle: "slug", group: "Content", defaultColumns: ["slug", "audience", "code", "_status"] },
  access: editorialAccess,
  versions,
  orderable: true,
  fields: [
    localizedText("name", "Segment name"),
    slugField,
    { name: "code", type: "text", required: true, unique: true },
    { name: "audience", type: "select", required: true, options: ["residential", "commercial"] },
    localizedTextarea("description", "Description"),
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "icon", type: "text" },
    { name: "featuredProducts", type: "relationship", relationTo: "products", hasMany: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
    ...seoFields,
  ],
};

export const SegmentPages: CollectionConfig = {
  slug: "segment-pages",
  dbName: "segmentpages",
  admin: { useAsTitle: "slug", group: "Content" },
  access: editorialAccess,
  versions,
  fields: [
    { name: "segment", type: "relationship", relationTo: "segments", required: true, unique: true },
    slugField,
    localizedText("heroHeadline"),
    localizedTextarea("heroSubheadline"),
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "heroCta", type: "group", fields: [localizedText("label"), { name: "url", type: "text" }] },
    {
      name: "contentBlocks",
      type: "blocks",
      blocks: [
        { slug: "text", labels: { singular: "Text section", plural: "Text sections" }, fields: [localizedText("heading"), localizedRichText("body")] },
        { slug: "image", labels: { singular: "Image", plural: "Images" }, fields: [{ name: "image", type: "upload", relationTo: "media", required: true }, localizedTextarea("alt")] },
        { slug: "cta", labels: { singular: "Call to action", plural: "Calls to action" }, fields: [localizedText("label"), { name: "url", type: "text", required: true }] },
      ],
    },
    { name: "featuredProducts", type: "relationship", relationTo: "products", hasMany: true },
    { name: "productLimit", type: "number", defaultValue: 6, min: 1, max: 24 },
    { name: "featuredProjects", type: "relationship", relationTo: "projects", hasMany: true },
    { name: "enquiryQueue", type: "select", options: ["", "consumer", "commercial"] },
    { name: "relatedSegments", type: "relationship", relationTo: "segments", hasMany: true },
    ...seoFields,
  ],
};

export const Products: CollectionConfig = {
  slug: "products",
  admin: { useAsTitle: "slug", group: "Catalog", defaultColumns: ["slug", "category", "productType", "isFeatured", "_status"] },
  access: editorialAccess,
  versions,
  orderable: true,
  fields: [
    localizedText("name", "Product name"),
    slugField,
    { name: "category", type: "relationship", relationTo: "categories", required: true },
    { name: "productType", type: "relationship", relationTo: "product-types", required: true },
    { name: "manufacturer", type: "relationship", relationTo: "manufacturers" },
    { name: "segments", type: "relationship", relationTo: "segments", hasMany: true },
    localizedTextarea("shortDescription"),
    localizedRichText("description"),
    { name: "features", type: "array", fields: [localizedText("text", "Feature")] },
    { name: "attributes", type: "json" },
    { name: "images", type: "array", fields: [{ name: "image", type: "upload", relationTo: "media", required: true }, localizedTextarea("alt"), { name: "type", type: "select", options: ["photo", "video_thumbnail", "360_spin"], defaultValue: "photo" }, { name: "sortOrder", type: "number" }] },
    { name: "videoUrl", type: "text" },
    { name: "videos", type: "relationship", relationTo: "videos", hasMany: true },
    { name: "spinImages", type: "array", fields: [{ name: "url", type: "text", required: true }] },
    { name: "fabrics", type: "relationship", relationTo: "fabrics", hasMany: true },
    { name: "colors", type: "relationship", relationTo: "colors", hasMany: true },
    { name: "relatedProducts", type: "relationship", relationTo: "products", hasMany: true },
    { name: "accessories", type: "relationship", relationTo: "accessories", hasMany: true },
    { name: "showPrice", type: "checkbox", defaultValue: true },
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "isNewArrival", type: "checkbox", defaultValue: false },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    ...seoFields,
  ],
};

export const Variants: CollectionConfig = {
  slug: "variants",
  admin: { useAsTitle: "sku", group: "Catalog" },
  access: editorialAccess,
  versions,
  fields: [
    { name: "product", type: "relationship", relationTo: "products", required: true, index: true },
    { name: "sku", type: "text", required: true, unique: true },
    localizedText("name", "Model / variant"),
    { name: "basePrice", type: "number", required: true, min: 0 },
    { name: "leadTimeDays", type: "number", min: 0 },
    { name: "leadTimeNote", type: "textarea", localized: true },
    { name: "freightClass", type: "number", min: 0 },
    { name: "dimensions", type: "json" },
    {
      name: "availability",
      type: "select",
      defaultValue: "made_to_order",
      options: ["in_stock", "made_to_order", "discontinued", "coming_soon"],
    },
    { name: "allowedOptionGroups", type: "relationship", relationTo: "option-groups", hasMany: true },
    {
      name: "images",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        localizedTextarea("alt", "Accessible alt text"),
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
    { name: "isDefault", type: "checkbox", defaultValue: false },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    {
      name: "priceTiers",
      type: "array",
      access: {
        read: ({ req }) => isStaff(req.user) && ["admin", "sales"].includes(req.user.role),
        update: ({ req }) => isStaff(req.user) && ["admin", "sales"].includes(req.user.role),
      },
      fields: [{ name: "tierKey", type: "text", required: true }, { name: "price", type: "number", min: 0 }],
    },
  ],
};

export const OptionGroups: CollectionConfig = {
  slug: "option-groups",
  dbName: "optiongroups",
  admin: { useAsTitle: "slug", group: "Catalog" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("name", "Option group"),
    slugField,
    { name: "displayType", type: "select", defaultValue: "dropdown", options: ["dropdown", "radio", "color_swatch", "button_group", "checkbox"] },
    { name: "isRequired", type: "checkbox", defaultValue: false },
    { name: "allowMultiple", type: "checkbox", defaultValue: false },
    localizedTextarea("description", "Description"),
    { name: "productTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "options", type: "array", fields: [
      localizedText("name", "Option name"),
      localizedText("label", "Legacy option label"),
      { name: "value", type: "text", required: true },
      localizedTextarea("description", "Description"),
      { name: "surchargeType", type: "select", required: true, defaultValue: "none", options: ["none", "fixed", "percent", "per_unit"] },
      { name: "surchargeAmount", type: "number", min: 0, defaultValue: 0 },
      { name: "image", type: "group", fields: [{ name: "image", type: "upload", relationTo: "media" }, localizedTextarea("alt", "Accessible alt text")] },
      { name: "color", type: "relationship", relationTo: "colors" },
      { name: "isAvailable", type: "checkbox", defaultValue: true },
      { name: "availableFrom", type: "date" },
      { name: "sortOrder", type: "number", defaultValue: 0 },
    ] },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
};

export const Fabrics: CollectionConfig = {
  slug: "fabrics",
  admin: { useAsTitle: "slug", group: "Catalog" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("name", "Fabric"),
    slugField,
    { name: "sku", type: "text" },
    { name: "brand", type: "text" },
    { name: "subRange", type: "text" },
    localizedTextarea("description", "Description"),
    { name: "composition", type: "text" },
    { name: "opennessFactor", type: "number", min: 0, max: 100 },
    { name: "weightGsm", type: "number", min: 0 },
    { name: "widthCm", type: "number", min: 0 },
    { name: "solarReflectance", type: "number", min: 0, max: 100 },
    { name: "solarAbsorption", type: "number", min: 0, max: 100 },
    { name: "solarTransmittance", type: "number", min: 0, max: 100 },
    { name: "uvBlock", type: "number", min: 0, max: 100 },
    { name: "warrantyYears", type: "number", min: 0 },
    localizedTextarea("warrantyNotes", "Warranty notes"),
    { name: "color", type: "text" },
    { name: "pattern", type: "select", defaultValue: "", options: ["", "solid", "stripe", "tweed", "weave", "custom"] },
    { name: "opacity", type: "select", defaultValue: "", options: ["", "sheer", "semi_sheer", "semi_opaque", "opaque"] },
    { name: "images", type: "array", fields: [
      { name: "image", type: "upload", relationTo: "media", required: true },
      localizedTextarea("alt", "Accessible alt text"),
      { name: "isSwatch", type: "checkbox", defaultValue: false },
      { name: "sortOrder", type: "number", defaultValue: 0 },
    ] },
    { name: "compatibleProductTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "colors", type: "relationship", relationTo: "colors", hasMany: true },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "isAvailable", type: "checkbox", defaultValue: true },
    { name: "sampleAvailable", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
};

export const Colors: CollectionConfig = {
  slug: "colors",
  admin: { useAsTitle: "slug", group: "Catalog" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("name", "Color"),
    slugField,
    { name: "system", type: "select", defaultValue: "standard", options: ["ral", "standard", "exclusive", "custom"] },
    { name: "code", type: "text" },
    { name: "hex", type: "text" },
    { name: "hexValue", type: "text", admin: { description: "Legacy color value; use Hex for new records." } },
    { name: "swatch", type: "upload", relationTo: "media" },
    { name: "finish", type: "select", defaultValue: "", options: ["", "matte", "gloss", "satin", "metallic", "textured"] },
    { name: "hasSurcharge", type: "checkbox", defaultValue: false },
    { name: "availabilityStatus", type: "select", defaultValue: "available", options: ["available", "discontinued", "coming_soon"] },
    { name: "availableFrom", type: "date" },
    { name: "compatibleProductTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
};

export const Accessories: CollectionConfig = {
  slug: "accessories",
  admin: { useAsTitle: "slug", group: "Catalog" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("name", "Accessory"),
    slugField,
    { name: "sku", type: "text" },
    localizedTextarea("description"),
    localizedTextarea("shortDescription"),
    { name: "compatibleProductTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "compatibleProducts", type: "relationship", relationTo: "products", hasMany: true },
    { name: "linkedProducts", type: "relationship", relationTo: "products", hasMany: true },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "images", type: "array", fields: [
      { name: "image", type: "upload", relationTo: "media", required: true },
      localizedTextarea("alt", "Accessible alt text"),
      { name: "sortOrder", type: "number", defaultValue: 0 },
    ] },
    { name: "basePrice", type: "number", required: true, min: 0 },
    {
      name: "priceTiers",
      type: "array",
      access: {
        read: ({ req }) => isStaff(req.user) && ["admin", "sales"].includes(req.user.role),
        update: ({ req }) => isStaff(req.user) && ["admin", "sales"].includes(req.user.role),
      },
      fields: [{ name: "tierKey", type: "text", required: true }, { name: "price", type: "number", required: true, min: 0 }],
    },
    { name: "availability", type: "select", defaultValue: "in_stock", options: ["in_stock", "made_to_order", "discontinued", "coming_soon"] },
    { name: "leadTimeDays", type: "number", defaultValue: 0, min: 0 },
    { name: "isConfiguratorOption", type: "checkbox", defaultValue: false },
    { name: "isCrossSell", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
    ...seoFields,
  ],
};

export const Documents: CollectionConfig = {
  slug: "documents",
  admin: { useAsTitle: "slug", group: "Content" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("title", "Document title"),
    slugField,
    { name: "type", type: "select", required: true, options: ["manual", "spec_sheet", "price_list", "order_form", "bim", "cad", "certificate", "warranty", "engineering_report", "brochure", "color_chart", "other"] },
    localizedTextarea("description"),
    { name: "file", type: "upload", relationTo: "private-documents", required: true },
    { name: "version", type: "text", required: true },
    { name: "currentVersion", type: "text", defaultValue: "1.0" },
    { name: "versions", type: "array", fields: [
      { name: "version", type: "text", required: true },
      { name: "file", type: "upload", relationTo: "private-documents", required: true },
      { name: "uploadedAt", type: "date" },
      { name: "notes", type: "textarea" },
    ] },
    { name: "effectiveDate", type: "date" },
    { name: "expiresAt", type: "date" },
    { name: "expiryDate", type: "date" },
    { name: "gated", type: "checkbox", defaultValue: true },
    { name: "gating", type: "select", defaultValue: "open", options: ["open", "email_required", "logged_in", "role_required"] },
    { name: "requiredRole", type: "select", defaultValue: "", options: ["", "customer", "installer", "specifier", "dealer", "staff"] },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "productTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "manufacturers", type: "relationship", relationTo: "manufacturers", hasMany: true },
    { name: "audienceTags", type: "select", hasMany: true, options: ["consumer", "installer", "specifier", "dealer", "architect", "engineer"] },
    { name: "downloadCount", type: "number", defaultValue: 0, min: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "showInResourceLibrary", type: "checkbox", defaultValue: true },
  ],
};

export const FAQs: CollectionConfig = {
  slug: "faqs",
  admin: { useAsTitle: "slug", group: "Content" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("question", "Question"),
    slugField,
    localizedRichText("answer", "Answer"),
    { name: "tags", type: "select", hasMany: true, options: ["general", "product-type", "model"] },
    { name: "productTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
  ],
};

export const LegalPages: CollectionConfig = {
  slug: "legal-pages",
  dbName: "legalpages",
  admin: { useAsTitle: "slug", group: "Content" },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("title", "Page title"),
    slugField,
    { name: "key", type: "text" },
    { name: "pageType", type: "select", required: true, options: ["privacy", "terms", "refunds", "accessibility", "cookies", "shipping", "custom"] },
    { name: "content", type: "richText", localized: true },
    { name: "effectiveDate", type: "date" },
    { name: "reviewedByCounsel", type: "checkbox", defaultValue: false, access: { update: isAdmin } },
    ...seoFields,
  ],
};

export const CategoryContent: CollectionConfig = {
  slug: "category-content",
  dbName: "categorycontents",
  admin: { useAsTitle: "category", group: "Content" },
  access: editorialAccess,
  versions,
  fields: [
    { name: "category", type: "relationship", relationTo: "categories", required: true, unique: true },
    localizedText("introHeading"),
    { name: "introContent", type: "richText", localized: true },
    localizedText("outroHeading"),
    { name: "outroContent", type: "richText", localized: true },
    { name: "buyingGuideLinks", type: "array", fields: [localizedText("label"), { name: "url", type: "text" }] },
    { name: "showComparisonCta", type: "checkbox", defaultValue: true },
    ...seoFields,
    { name: "crawlableFilterKeys", type: "json", admin: { description: "Array of attribute keys whose single-filter URLs may be indexed, for example [\"mount_type\", \"operation\"]." } },
  ],
};

export const ProductContent: CollectionConfig = {
  slug: "product-content",
  dbName: "productcontents",
  admin: { useAsTitle: "product", group: "Content" },
  access: editorialAccess,
  versions,
  fields: [
    { name: "product", type: "relationship", relationTo: "products", required: true, unique: true },
    localizedText("productIntro", "Product introduction"),
    localizedTextarea("specNotes", "Specification notes"),
    localizedRichText("operationOverview", "Operation overview"),
    { name: "motorBrands", type: "json" },
    localizedTextarea("motorNotes", "Motor notes"),
    localizedRichText("frameOverview", "Frame overview"),
    localizedText("operationHeading"),
    { name: "operationContent", type: "richText", localized: true, admin: { description: "Legacy field; prefer Operation overview for new content." } },
    { name: "frameFeatures", type: "array", fields: [
      { name: "icon", type: "text" },
      localizedText("heading"),
      localizedTextarea("description"),
      { name: "body", type: "richText", localized: true, admin: { description: "Legacy field; prefer Description for new content." } },
      { name: "image", type: "upload", relationTo: "media" },
    ] },
    localizedText("fabricOverview", "Fabric overview"),
    localizedTextarea("valanceOptions", "Valance options"),
    localizedTextarea("threadColors", "Sewing thread colors"),
    localizedTextarea("fabricNotes", "Fabric notes"),
    localizedTextarea("heatSealingDescription", "Heat sealing"),
    { name: "heatSealingImage", type: "upload", relationTo: "media" },
    { name: "heatSealingImageUrl", type: "text", admin: { description: "Legacy image URL; prefer the uploaded Heat sealing image." } },
    { name: "installationTypes", type: "array", fields: [
      localizedText("name", "Installation type"),
      localizedText("label", "Legacy label"),
      localizedTextarea("description"),
      { name: "image", type: "upload", relationTo: "media" },
      { name: "imageUrl", type: "text", admin: { description: "Legacy image URL; prefer the uploaded image." } },
      { name: "mountTypes", type: "json" },
      { name: "isActive", type: "checkbox", defaultValue: true },
      { name: "sortOrder", type: "number", defaultValue: 0 },
    ] },
    localizedTextarea("warrantyOverview", "Warranty overview"),
    { name: "warrantyTiers", type: "array", fields: [
      localizedText("component", "Covered component"),
      { name: "years", type: "number", required: true, min: 0 },
      localizedTextarea("description"),
    ] },
    { name: "warrantyPdf", type: "upload", relationTo: "private-documents" },
    localizedTextarea("financingNote", "Financing fallback"),
    { name: "warranty", type: "relationship", relationTo: "documents", hasMany: true },
  ],
};

export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: { useAsTitle: "reviewerName", group: "Operations" },
  access: {
    admin: canUseAdmin,
    create: staffRoles("admin", "support"),
    read: ({ req }) => {
      if (isStaff(req.user)) return true;
      const publishedApprovedReviews: Where = {
        and: [
          { _status: { equals: "published" } },
          { moderationStatus: { equals: "approved" } },
        ],
      };
      return publishedApprovedReviews;
    },
    update: staffRoles("admin", "support"),
    delete: staffRoles("admin"),
  },
  versions,
  fields: [
    { name: "reviewerName", type: "text", required: true },
    { name: "product", type: "relationship", relationTo: "products", required: true },
    { name: "rating", type: "number", required: true, min: 1, max: 5 },
    localizedTextarea("title", "Review title"),
    localizedRichText("body", "Review"),
    { name: "verifiedPurchase", type: "checkbox", defaultValue: false },
    { name: "moderationStatus", type: "select", required: true, defaultValue: "pending", options: ["pending", "approved", "rejected"] },
    { name: "attachments", type: "relationship", relationTo: "private-documents", hasMany: true },
  ],
};

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: { useAsTitle: "slug", group: "Content", defaultColumns: ["slug", "location.city", "isFeatured", "_status"] },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("title", "Project title"),
    slugField,
    localizedRichText("description"),
    {
      name: "location",
      type: "group",
      fields: [
        { name: "city", type: "text" },
        { name: "state", type: "text" },
        { name: "country", type: "text", defaultValue: "US" },
      ],
    },
    { name: "areaSqFt", type: "number", min: 0 },
    { name: "installerName", type: "text" },
    {
      name: "installerProfileUrl",
      type: "text",
      validate: (value: unknown) => {
        if (!value) return true;
        if (/^\/find-installer\/[a-z0-9-]+$/i.test(String(value))) return true;
        try {
          return new URL(String(value)).protocol === "https:" || "Installer profile URL must use HTTPS.";
        } catch {
          return "Enter an internal installer profile path or an HTTPS URL.";
        }
      },
    },
    { name: "segment", type: "relationship", relationTo: "segments", hasMany: true },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    {
      name: "gallery",
      type: "array",
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        localizedTextarea("alt"),
        { name: "isBefore", type: "checkbox", defaultValue: false },
        { name: "isAfter", type: "checkbox", defaultValue: false },
        { name: "sortOrder", type: "number", defaultValue: 0 },
      ],
    },
    localizedTextarea("challenge", "Case study: challenge"),
    localizedTextarea("solution", "Case study: solution"),
    localizedTextarea("budget", "Budget"),
    localizedTextarea("results", "Results"),
    localizedTextarea("energySavings", "Energy savings"),
    {
      name: "metrics",
      type: "array",
      fields: [
        localizedText("label", "Metric"),
        { name: "value", type: "text", required: true },
        { name: "unit", type: "text" },
      ],
    },
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "completedAt", type: "date" },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    ...seoFields,
  ],
};

export const InspirationItems: CollectionConfig = {
  slug: "inspiration-items",
  admin: {
    useAsTitle: "slug",
    group: "Content",
    defaultColumns: ["slug", "style", "productType", "setting", "isFeatured", "_status"],
  },
  access: editorialAccess,
  versions,
  fields: [
    localizedText("title", "Image title"),
    slugField,
    { name: "image", type: "upload", relationTo: "media", required: true },
    localizedTextarea("alt", "Accessible alt text"),
    { name: "style", type: "text", index: true },
    { name: "productType", type: "relationship", relationTo: "product-types" },
    { name: "setting", type: "text", index: true },
    { name: "color", type: "text", index: true },
    { name: "manufacturer", type: "relationship", relationTo: "manufacturers" },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "project", type: "relationship", relationTo: "projects" },
    { name: "isFeatured", type: "checkbox", defaultValue: false },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    ...seoFields,
  ],
};

const validateVideoUrl = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return "A video URL is required.";
  try {
    const parsed = new URL(value);
    const supportedHosts = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
      "vimeo.com",
      "www.vimeo.com",
      "player.vimeo.com",
      "wistia.com",
      "www.wistia.com",
      "fast.wistia.net",
    ];
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      !supportedHosts.includes(parsed.hostname.toLowerCase())
    ) {
      return "Use an HTTPS YouTube, Vimeo, or Wistia video URL.";
    }
    const host = parsed.hostname.toLowerCase();
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const videoId = host === "youtu.be"
      ? pathParts[0]
      : host.includes("youtube")
        ? parsed.searchParams.get("v") || pathParts[pathParts.length - 1]
        : host.includes("vimeo")
          ? pathParts[pathParts.length - 1]
          : pathParts[pathParts.length - 1];
    if (!videoId || !/^[\w-]{6,}$/.test(videoId)) return "The URL must point to a specific hosted video.";
    return true;
  } catch {
    return "Enter a valid video URL.";
  }
};

export const Videos: CollectionConfig = {
  slug: "videos",
  admin: { useAsTitle: "videoUrl", group: "Content", defaultColumns: ["videoUrl", "category", "isActive", "_status"] },
  access: editorialAccess,
  versions,
  fields: [
    {
      name: "videoUrl",
      type: "text",
      required: true,
      unique: true,
      validate: validateVideoUrl,
      admin: { description: "Paste the hosted video URL. The video is embedded from this URL; no video file upload is needed." },
    },
    localizedText("title", "Optional title"),
    localizedTextarea("description", "Optional description"),
    {
      name: "category",
      type: "select",
      options: ["installation", "demo", "walkthrough", "fly-through", "testimonial", "factory-tour", "maintenance"],
    },
    { name: "thumbnail", type: "upload", relationTo: "media" },
    { name: "products", type: "relationship", relationTo: "products", hasMany: true },
    { name: "chapters", type: "array", fields: [
      { name: "title", type: "text", required: true },
      { name: "seconds", type: "number", required: true, min: 0 },
    ] },
    localizedTextarea("transcript", "Transcript"),
    { name: "captionsUrl", type: "text", validate: (value: unknown) => {
      if (value === undefined || value === null || value === "") return true;
      try {
        return new URL(String(value)).protocol === "https:" || "Captions URL must use HTTPS.";
      } catch {
        return "Enter a valid captions URL.";
      }
    } },
    { name: "isActive", type: "checkbox", defaultValue: true },
    { name: "sortOrder", type: "number", defaultValue: 0 },
    ...seoFields,
  ],
};

export const Redirects: CollectionConfig = {
  slug: "redirects",
  admin: { useAsTitle: "from", group: "Content" },
  access: editorialAccess,
  versions,
  fields: [
    { name: "from", type: "text", required: true, unique: true },
    { name: "to", type: "text", required: true },
    { name: "type", type: "select", required: true, defaultValue: "301", options: ["301", "302"] },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
};

export const LeadRoutingRules: CollectionConfig = {
  slug: "lead-routing-rules",
  dbName: "leadroutingconfigs",
  admin: { useAsTitle: "name", group: "Operations" },
  access: adminOnlyAccess,
  fields: [
    { name: "name", type: "text", required: true },
    { name: "enquiryTypes", type: "select", hasMany: true, options: ["quote", "contact", "service", "dealer", "installer", "commercial"] },
    { name: "regions", type: "array", fields: [{ name: "country", type: "text" }, { name: "state", type: "text" }, { name: "postalPrefix", type: "text" }] },
    { name: "productTypes", type: "relationship", relationTo: "product-types", hasMany: true },
    { name: "recipientEmails", type: "array", fields: [{ name: "email", type: "email", required: true }] },
    { name: "priority", type: "number", defaultValue: 0 },
    { name: "isActive", type: "checkbox", defaultValue: true },
  ],
};

export const CmsCollections: CollectionConfig[] = [
  Users,
  Media,
  PrivateDocuments,
  Categories,
  ProductTypes,
  AttributeDefinitions,
  Manufacturers,
  Segments,
  SegmentPages,
  Products,
  Variants,
  OptionGroups,
  Fabrics,
  Colors,
  Accessories,
  Documents,
  FAQs,
  LegalPages,
  CategoryContent,
  ProductContent,
  Reviews,
  Projects,
  InspirationItems,
  Videos,
  Redirects,
  LeadRoutingRules,
];
