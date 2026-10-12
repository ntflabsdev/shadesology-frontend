export type SuggestionReason = "Style match" | "Orientation fit" | "Material harmony" | "Coverage efficiency" | "Budget fit";

export interface AIRecommendation {
  productKey: "awning" | "pergola" | "screen" | "shade-sail" | "louvered";
  title: string;
  confidence: number;
  reasons: SuggestionReason[];
  recommendedFinish: string;
  recommendedProjection: string;
  estimatedPrice: number;
  image: string;
  catalogGuardrails: string[];
}

export const aiRecommendations: AIRecommendation[] = [
  {
    productKey: "awning",
    title: "Patio awning recommendation",
    confidence: 92,
    reasons: ["Style match", "Orientation fit", "Coverage efficiency"],
    recommendedFinish: "Sandstone / performance fabric",
    recommendedProjection: "10 ft projection",
    estimatedPrice: 4200,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    catalogGuardrails: ["Use only catalog fabrics", "Projection limited to 8-14 ft", "No wind rating above configured spec"],
  },
  {
    productKey: "pergola",
    title: "Wood-look pergola concept",
    confidence: 87,
    reasons: ["Style match", "Material harmony", "Coverage efficiency"],
    recommendedFinish: "Forest bronze frame / driftwood fabric",
    recommendedProjection: "12 ft projection",
    estimatedPrice: 6800,
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    catalogGuardrails: ["Only mapped pergola models", "Finish matches allowed fabric set", "No unsupported structural claim"],
  },
  {
    productKey: "screen",
    title: "Privacy screen pairing",
    confidence: 81,
    reasons: ["Orientation fit", "Material harmony"],
    recommendedFinish: "Charcoal privacy screen",
    recommendedProjection: "6 ft span",
    estimatedPrice: 2350,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
    catalogGuardrails: ["Screen product only", "Mounting must match approved surfaces", "No unlisted wind claim"],
  },
];

export const aiDesignGuardrails = {
  supportedProducts: ["awning", "pergola", "screen", "shade-sail", "louvered"],
  disallowedClaims: ["invented sizes", "unlisted wind ratings", "unsupported material specs"],
};
