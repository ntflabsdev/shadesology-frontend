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
const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || "";
const publicBucket = process.env.S3_BUCKET_PUBLIC;
const privateBucket = process.env.S3_BUCKET_PRIVATE;
const developmentSecret = "local-development-only-payload-secret-change-before-deploy";
const payloadSecret = process.env.PAYLOAD_SECRET || (
  process.env.NODE_ENV === "production" ? "" : developmentSecret
);

if (process.env.NODE_ENV === "production") {
  if (payloadSecret.length < 32) {
    throw new Error("PAYLOAD_SECRET must contain at least 32 characters in production.");
  }
  if (!databaseUri || !publicBucket || !privateBucket) {
    throw new Error("DATABASE_URI, S3_BUCKET_PUBLIC, and S3_BUCKET_PRIVATE are required in production.");
  }
}

const s3Region = process.env.AWS_REGION || "us-east-1";
const s3Config = { region: s3Region };
const storageEnabled = process.env.NODE_ENV === "production" ||
  (Boolean(publicBucket) && Boolean(privateBucket));

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname, "app/(payload)/admin"),
    },
    components: {
      beforeDashboard: ["@/payload/admin/OperationalLinks#OperationalLinks"],
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
