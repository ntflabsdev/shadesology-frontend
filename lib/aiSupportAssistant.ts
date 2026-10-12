export type KnowledgeSource = {
  title: string;
  slug: string;
  snippet: string;
  type: "catalog" | "faq" | "manual" | "policy";
};

export type AssistantAnswer = {
  answer: string;
  citations: string[];
  confidence: number;
  guardrails: string[];
  suggestions: string[];
  escalation: boolean;
};

const knowledgeBase: KnowledgeSource[] = [
  {
    title: "Retractable awning lead times",
    slug: "/products/awnings",
    snippet: "Made-to-order awnings typically ship within 10–21 business days depending on size, fabric, motorization and installation complexity.",
    type: "catalog",
  },
  {
    title: "Pergola installation guidance",
    slug: "/resources/pergola-installation",
    snippet: "Pergola systems require a valid mounting surface, clear site access and a review of structural load before final specification.",
    type: "manual",
  },
  {
    title: "Privacy screen product guidance",
    slug: "/products/screens",
    snippet: "Privacy screens are best for patios, glazing and terrace edges where wind and visibility control are the primary goals.",
    type: "catalog",
  },
  {
    title: "Warranty coverage",
    slug: "/warranty",
    snippet: "Frame and fabric warranties vary by product family and finish, and products are covered against defects as listed in the product-specific warranty policy.",
    type: "policy",
  },
  {
    title: "Finding an installer",
    slug: "/find-installer",
    snippet: "Certified installer matching is available for most product types and can be filtered by location and project type.",
    type: "faq",
  },
  {
    title: "Support and order help",
    slug: "/support/orders",
    snippet: "Order and delivery questions can be reviewed through our support center and tracking workflows for logged-in customers.",
    type: "faq",
  },
  {
    title: "Fabric care guidelines",
    slug: "/support/faq",
    snippet: "Fabric care instructions depend on the material family, but routine cleaning and seasonal inspection are recommended for all outdoor fabrics.",
    type: "faq",
  },
  {
    title: "Engineering and design safety",
    slug: "/support/service",
    snippet: "Engineering signoff, site-specific wind ratings and custom structural calculations are handled through our engineering review workflow.",
    type: "manual",
  },
];

const engineeringRefusal =
  "I can help with product fit, catalog guidance and recommended starting configurations, but I can’t invent engineering ratings, exact wind loads or site-specific structural guarantees. For those, a qualified engineer or our review team should confirm the final specification.";

export function answerSupportQuestion(question: string): AssistantAnswer {
  const normalized = question.toLowerCase();

  if (/wind|rating|engineering|structural|safety|load/.test(normalized)) {
    return {
      answer: engineeringRefusal,
      citations: ["Engineering review workflow", "Warranty and specification guidance"],
      confidence: 96,
      guardrails: ["Never invent wind ratings", "Only cite published or reviewed product data", "Escalate to engineering review"],
      suggestions: ["Review product specs", "Request engineering review", "Compare available mounting options"],
      escalation: true,
    };
  }

  if (/lead time|delivery|ship|arrive|timeline/.test(normalized)) {
    return {
      answer: "Most made-to-order awnings and shade products are built to order and usually ship within 10–21 business days. Exact timing depends on the selected size, finish, motorization and installation options, and the product page shows the current lead time for that configuration.",
      citations: ["Retractable awning lead times", "Shipping policy"],
      confidence: 92,
      guardrails: ["Uses catalog lead-time guidance only", "No claim beyond published delivery windows"],
      suggestions: ["Check an awning product page", "Compare motorized vs manual timing", "Request a quote for your exact size"],
      escalation: false,
    };
  }

  if (/install|installer|local|professional/.test(normalized)) {
    return {
      answer: "Shadesology supports a certified installer network and can help match you to a local installer based on project type and region. This is the best path for complex or structural installs, or for systems requiring mounting review.",
      citations: ["Finding an installer", "Pergola installation guidance"],
      confidence: 91,
      guardrails: ["Only recommends installer matching and review paths", "Never impersonates a licensed installer"],
      suggestions: ["Find an installer", "Review installation manuals", "Compare product-specific mounting options"],
      escalation: false,
    };
  }

  if (/warranty|coverage|defect/.test(normalized)) {
    return {
      answer: "Warranty coverage varies by product family and finish. Structural frame coverage and fabric coverage are published on the relevant product page and warranty policy, and the exact terms should be matched to your selected product before purchase.",
      citations: ["Warranty coverage", "Support and order help"],
      confidence: 89,
      guardrails: ["Avoid specific warranty durations unless listed", "Use product-family policy language"],
      suggestions: ["Open warranty policy", "Check the product page", "Submit a warranty claim"],
      escalation: false,
    };
  }

  if (/privacy|screen|patio|glazing/.test(normalized)) {
    return {
      answer: "Privacy screens are a strong fit for patios, glazing and terrace-facing edges when the goal is visibility control, shading and wind protection. We’d typically start with a screen size and mounting method matched to the exact opening and local exposure.",
      citations: ["Privacy screen product guidance", "Finding an installer"],
      confidence: 88,
      guardrails: ["Keeps recommendations aligned to catalog products", "Does not claim an unreviewed wind rating"],
      suggestions: ["Browse privacy screens", "Review screen mounting options", "Use the design configurator"],
      escalation: false,
    };
  }

  if (/fabric|clean|care|maintenance/.test(normalized)) {
    return {
      answer: "Fabric care depends on the selected material family, but a good baseline is regular cleaning, seasonal inspection and prompt attention to debris or moisture buildup. Product-specific care instructions are available in the relevant manual and support FAQ sections.",
      citations: ["Fabric care guidelines", "Support and order help"],
      confidence: 86,
      guardrails: ["Avoid product-specific chemical claims unless in docs", "Reference general guidance only"],
      suggestions: ["Review cleaning guidance", "Open the FAQ library", "Ask about a specific fabric family"],
      escalation: false,
    };
  }

  const fallback = knowledgeBase[Math.abs(normalized.length) % knowledgeBase.length];
  return {
    answer: `I can help with product guidance, project fit and support next steps. Based on your question, the closest product guidance is ${fallback.title}. ${fallback.snippet}`,
    citations: [fallback.title, fallback.slug],
    confidence: 73,
    guardrails: ["Only references catalog and policy guidance", "No unverified technical claims"],
    suggestions: ["Browse related products", "Open the FAQ library", "Use the design configurator"],
    escalation: false,
  };
}

export const assistantQuickPrompts = [
  "What is the lead time for a retractable awning?",
  "Can you help me choose a privacy screen for my patio?",
  "Can I get a wind rating for this pergola?",
  "How do I find an installer near me?",
  "What should I know about fabric care?",
];
