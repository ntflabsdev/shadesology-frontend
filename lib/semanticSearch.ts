export type SemanticSearchSuggestion = {
  title: string;
  subtitle: string;
  href: string;
  matchScore: number;
  reasons: string[];
  productType: "awning" | "pergola" | "shade-sail" | "screen" | "content";
};

const suggestionCatalog: Array<Omit<SemanticSearchSuggestion, "matchScore" | "reasons"> & { keywords: string[] }> = [
  {
    title: "Patio awning collections",
    subtitle: "Outdoor shade for decks, windows and lounging areas",
    href: "/products?category=awnings",
    productType: "awning",
    keywords: ["awning", "patio", "deck", "outdoor", "shade", "sun"],
  },
  {
    title: "Pergola and outdoor living",
    subtitle: "Covered entertaining zones with framed structure",
    href: "/products?category=pergolas",
    productType: "pergola",
    keywords: ["pergola", "garden", "outdoor living", "covered", "entertaining", "structure"],
  },
  {
    title: "Shade sail guidance",
    subtitle: "Dynamic tensioned coverage for open spaces and pools",
    href: "/products?category=shade-sails",
    productType: "shade-sail",
    keywords: ["shade sail", "shade sail", "tension", "pool", "open space", "sun protection"],
  },
  {
    title: "Privacy screen solutions",
    subtitle: "Wind and privacy control for patios and glazing",
    href: "/products?category=screens",
    productType: "screen",
    keywords: ["screen", "privacy", "wind", "glazing", "window", "patio privacy"],
  },
  {
    title: "Design inspiration and guides",
    subtitle: "Project planning, specs and installation resources",
    href: "/inspiration",
    productType: "content",
    keywords: ["guide", "inspiration", "ideas", "installation", "style", "project"],
  },
];

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

export function getSemanticSearchSuggestions(query: string): SemanticSearchSuggestion[] {
  const normalized = normalize(query);
  if (!normalized) {
    return suggestionCatalog.slice(0, 3).map((item) => ({
      ...item,
      matchScore: 88,
      reasons: ["Popular seasonal intent", "Strong product fit"],
    }));
  }

  const tokens = normalized.split(" ").filter(Boolean);

  return suggestionCatalog
    .map((item) => {
      const keywordMatches = item.keywords.filter((keyword) => normalized.includes(normalize(keyword)));
      const tokenHits = tokens.filter((token) => item.keywords.some((keyword) => normalize(keyword).includes(token))).length;
      const score = Math.min(98, 38 + keywordMatches.length * 18 + tokenHits * 12);
      const reasons = [
        keywordMatches.length > 0 ? `Matches “${keywordMatches[0]}”` : "Application fit",
        tokenHits > 0 ? "Query wording aligns with catalog intent" : "Recommended for nearby use cases",
      ];

      return {
        ...item,
        matchScore: Math.round(score),
        reasons,
      };
    })
    .filter((item) => item.matchScore >= 40)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);
}

export function getSemanticSearchHighlights(query: string) {
  const normalized = normalize(query);
  if (!normalized) {
    return ["Seasonal shade planning", "Design guidance", "Project-ready recommendations"];
  }

  const hints = [
    normalized.includes("patio") || normalized.includes("deck") ? "Patio and deck coverage" : "Outdoor living coverage",
    normalized.includes("privacy") || normalized.includes("screen") ? "Privacy + wind control" : "Shade and screening",
    normalized.includes("sun") || normalized.includes("heat") ? "Heat and UV reduction" : "Sun performance planning",
  ];

  return hints;
}
