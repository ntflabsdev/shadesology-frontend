import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const messagesDirectory = fileURLToPath(new URL("../i18n/messages/", import.meta.url));
const supportedLocales = new Set(["en", "es", "de", "it", "fr", "pt"]);

function validateMessages(value, pathName = "messages") {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${pathName} must be a JSON object.`);
  }
  for (const [key, item] of Object.entries(value)) {
    if (!key.trim()) throw new Error(`${pathName} contains an empty key.`);
    if (typeof item === "string") continue;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      validateMessages(item, `${pathName}.${key}`);
      continue;
    }
    throw new Error(`${pathName}.${key} must be a string or nested object.`);
  }
}

const [operation, locale, filePath] = process.argv.slice(2);
if (!["export", "import"].includes(operation) || !supportedLocales.has(locale)) {
  throw new Error("Usage: npm run translations -- <export|import> <en|es|de|it|fr|pt> [file.json]");
}

const localeFile = path.join(messagesDirectory, `${locale}.json`);
if (operation === "export") {
  const contents = await readFile(localeFile, "utf8");
  if (filePath) {
    await writeFile(path.resolve(filePath), contents, "utf8");
  } else {
    process.stdout.write(contents);
  }
} else {
  if (!filePath) throw new Error("Import requires a JSON file path.");
  const imported = JSON.parse(await readFile(path.resolve(filePath), "utf8"));
  validateMessages(imported);
  await writeFile(localeFile, `${JSON.stringify(imported, null, 2)}\n`, "utf8");
}
