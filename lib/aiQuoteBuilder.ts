export type DraftQuoteProductType = "awning" | "pergola" | "screen" | "shade-sail" | "umbrella" | "mixed";

export interface QuoteDraftLine {
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuoteDraftResult {
  title: string;
  productType: DraftQuoteProductType;
  confidence: number;
  dims: {
    width: string;
    projection: string;
    mounting: string;
    finish: string;
  };
  totalEstimate: number;
  quoteLines: QuoteDraftLine[];
  flags: string[];
  clarifications: string[];
  humanReviewRequired: boolean;
  queue: string;
  summary: string;
}

const productProfiles: Record<Exclude<DraftQuoteProductType, "mixed">, { base: number; label: string; finish: string }> = {
  awning: { base: 4200, label: "Retractable awning", finish: "Performance fabric / sandstone" },
  pergola: { base: 8100, label: "Fabric pergola", finish: "Bronze frame / driftwood fabric" },
  screen: { base: 2400, label: "Privacy screen", finish: "Charcoal mesh / privacy finish" },
  "shade-sail": { base: 2800, label: "Shade sail", finish: "White tensioned sail" },
  umbrella: { base: 1800, label: "Umbrella system", finish: "Canvas / marine finish" },
};

function parseProjectDescription(description: string) {
  const value = description.toLowerCase();
  const productType: DraftQuoteProductType = value.includes("pergola")
    ? "pergola"
    : value.includes("screen") || value.includes("privacy")
      ? "screen"
      : value.includes("sail") || value.includes("tension")
        ? "shade-sail"
        : value.includes("umbrella")
          ? "umbrella"
          : value.includes("awning") || value.includes("patio") || value.includes("deck")
            ? "awning"
            : "mixed";

  const widthMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet|ft\.)/i);
  const projectionMatch = description.match(/(\d+(?:\.\d+)?)\s*(?:projection|depth|span)/i);
  const mountingMatch = /wall|roof|fascia|soffit|post|freestanding/.test(value) ?
    (/freestanding/.test(value) ? "Freestanding" : /roof|fascia|soffit/.test(value) ? "Roof / fascia mount" : "Wall mount") :
    "Mounting to confirm";

  const finishMatch = /charcoal|sandstone|bronze|forest|ivory|white|driftwood/.test(value)
    ? description.match(/(charcoal|sandstone|bronze|forest|ivory|white|driftwood)/i)?.[1] ?? "Requested finish"
    : "Finish not confirmed";

  return {
    productType,
    width: widthMatch ? `${widthMatch[1]} ft` : "To confirm",
    projection: projectionMatch ? `${projectionMatch[1]} ft` : "To confirm",
    mounting: mountingMatch,
    finish: finishMatch,
  };
}

export function generateDraftQuote({
  description,
  budget,
  drawingIncluded,
}: {
  description: string;
  budget?: number;
  drawingIncluded?: boolean;
}): QuoteDraftResult {
  const parsed = parseProjectDescription(description);
  const productType = parsed.productType === "mixed" ? "awning" : parsed.productType;
  const profile = productProfiles[productType as Exclude<DraftQuoteProductType, "mixed">];

  const configuredBase = Math.max(1500, Number(budget) || profile.base);
  const quantity = 1;
  const fabricSurcharge = /fabric|mesh|canvas|sunbrella|solar/.test(description.toLowerCase()) ? 760 : 0;
  const motorSurcharge = /motor|remote|automatic|electric/.test(description.toLowerCase()) ? 1400 : 0;
  const installationSurcharge = /install|mount|roof|fascia|freestanding/.test(description.toLowerCase()) ? 900 : 420;
  const subtotal = configuredBase + fabricSurcharge + motorSurcharge + installationSurcharge;

  const quoteLines: QuoteDraftLine[] = [
    { label: profile.label, quantity, unitPrice: configuredBase, total: configuredBase },
    ...(fabricSurcharge ? [{ label: "Fabric / finish upgrade", quantity: 1, unitPrice: fabricSurcharge, total: fabricSurcharge }] : []),
    ...(motorSurcharge ? [{ label: "Motor / automation package", quantity: 1, unitPrice: motorSurcharge, total: motorSurcharge }] : []),
    { label: "Project review & mounting guidance", quantity: 1, unitPrice: installationSurcharge, total: installationSurcharge },
  ];

  const flags: string[] = [];
  const clarifications: string[] = [];

  if (parsed.width === "To confirm") clarifications.push("Confirm width in feet or metric.");
  if (parsed.projection === "To confirm") clarifications.push("Confirm projection or desired shade depth.");
  if (parsed.mounting === "Mounting to confirm") clarifications.push("Confirm mounting surface and bracket type.");
  if (parsed.finish === "Finish not confirmed") clarifications.push("Choose a preferred finish or fabric palette.");
  if (drawingIncluded === false) flags.push("No drawing or photo attached yet; project assumptions may need revision.");
  if (/wind|exposed|coastal|open/.test(description.toLowerCase())) flags.push("Site exposure may require engineering review for wind load.");

  const confidenceBase = 76;
  const confidence = Math.min(98, confidenceBase + (drawingIncluded ? 8 : 0) + (clarifications.length === 0 ? 8 : 0) + (parsed.productType !== "mixed" ? 6 : 2));

  return {
    title: `AI draft for ${profile.label}`,
    productType,
    confidence: Math.round(confidence),
    dims: {
      width: parsed.width,
      projection: parsed.projection,
      mounting: parsed.mounting,
      finish: parsed.finish,
    },
    totalEstimate: subtotal,
    quoteLines,
    flags: flags.length ? flags : ["No blocking issues at this stage; human review still required."],
    clarifications: clarifications.length ? clarifications : ["No clarifications needed at this stage; final production review will confirm exact details."],
    humanReviewRequired: true,
    queue: "quote-review",
    summary: `Draft quote ready for staff review. The initial estimate is aligned to a ${profile.label.toLowerCase()} project and is designed to be validated before sending to the customer.`,
  };
}
