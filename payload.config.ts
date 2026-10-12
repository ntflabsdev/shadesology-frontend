import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { s3Storage } from "@payloadcms/storage-s3";
import sharp from "sharp";
import { CmsCollections } from "./payload/collections";
import { CmsGlobals } from "./payload/globals";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDatabaseUri = "mongodb://127.0.0.1:27017/shadesology";
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || defaultDatabaseUri;
const publicBucket = process.env.S3_BUCKET_PUBLIC || "local-public-media";
const privateBucket = process.env.S3_BUCKET_PRIVATE || "local-private-documents";
const developmentSecret = "local-development-only-payload-secret-change-before-deploy";
const payloadSecret = process.env.PAYLOAD_SECRET || developmentSecret;
const strictEnvValidation = process.env.PAYLOAD_STRICT_ENV === "true";

if (strictEnvValidation) {
  if (payloadSecret.length < 32) {
    throw new Error("PAYLOAD_SECRET must contain at least 32 characters when PAYLOAD_STRICT_ENV=true.");
  }
  if (!process.env.DATABASE_URI && !process.env.MONGODB_URI) {
    throw new Error("DATABASE_URI or MONGODB_URI is required when PAYLOAD_STRICT_ENV=true.");
  }
  if (!process.env.S3_BUCKET_PUBLIC || !process.env.S3_BUCKET_PRIVATE) {
    throw new Error("S3_BUCKET_PUBLIC and S3_BUCKET_PRIVATE are required when PAYLOAD_STRICT_ENV=true.");
  }
}

const s3Region = process.env.AWS_REGION || "us-east-1";
const s3Config = { region: s3Region };
const storageEnabled = Boolean(process.env.S3_BUCKET_PUBLIC) && Boolean(process.env.S3_BUCKET_PRIVATE);

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname, "app/(payload)/admin"),
    },
    components: {
      beforeLogin: ["@/payload/admin/BackendStaffLoginLink#BackendStaffLoginLink"],
      beforeDashboard: ["@/payload/admin/OperationalLinks#OperationalLinks"],
      views: {
        orders: {
          Component: "@/payload/admin/workspaces/OrdersWorkspace",
          path: "/orders",
          exact: true,
        },
        orderDetail: {
          Component: "@/payload/admin/workspaces/OrderDetailWorkspace",
          path: "/orders/:id",
          exact: true,
        },
        quotes: {
          Component: "@/payload/admin/workspaces/QuotesWorkspace",
          path: "/quotes",
          exact: true,
        },
        quoteDetail: {
          Component: "@/payload/admin/workspaces/QuoteDetailWorkspace",
          path: "/quotes/:id",
          exact: true,
        },
        leads: {
          Component: "@/payload/admin/workspaces/LeadsWorkspace",
          path: "/leads",
          exact: true,
        },
        installers: {
          Component: "@/payload/admin/workspaces/InstallersWorkspace",
          path: "/installers",
          exact: true,
        },
        crm: {
          Component: "@/payload/admin/workspaces/CrmWorkspace",
          path: "/crm",
          exact: true,
        },
      },
    },
  },
  collections: CmsCollections,
  globals: CmsGlobals,
  editor: lexicalEditor(),
  secret: payloadSecret,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: mongooseAdapter({
    url: databaseUri,
    connectOptions: { dbName: process.env.DB_NAME || "shadesology" },
  }),
  localization: {
    locales: [
      { code: "en", label: "English" },
      { code: "es", label: "Español" },
      { code: "de", label: "Deutsch" },
      { code: "fr", label: "Français" },
      { code: "it", label: "Italiano" },
      { code: "pt", label: "Português" },
    ],
    defaultLocale: "en",
    fallback: true,
  },
  upload: {
    abortOnLimit: true,
    requestSizeLimit: 25 * 1024 * 1024,
    safeFileNames: true,
    preserveExtension: true,
  },
  plugins: [
    s3Storage({
      bucket: publicBucket || "local-public-media",
      collections: { media: { prefix: "media" } },
      config: s3Config,
      acl: "public-read",
      enabled: storageEnabled,
      alwaysInsertFields: true,
    }),
    s3Storage({
      bucket: privateBucket || "local-private-documents",
      collections: {
        "private-documents": {
          prefix: "private-documents",
          signedDownloads: { expiresIn: Number(process.env.S3_SIGNED_URL_EXPIRES || 3600) },
        },
      },
      config: s3Config,
      acl: "private",
      enabled: storageEnabled,
      alwaysInsertFields: true,
    }),
  ],
});
