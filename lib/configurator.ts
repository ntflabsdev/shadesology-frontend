export type AwningFabricKey = "performance" | "sunscreen" | "luxury";
export type AwningOperationKey = "manual" | "motorized" | "smart";
export type AwningInstallationKey = "standard" | "premium" | "structural";
export type AwningColorKey = "sandstone" | "charcoal" | "ivory" | "forest";
export type AwningExtraKey = "windSensor" | "valance" | "dropShade" | "smartWeather";

export interface RetractableAwningConfig {
  width: number;
  projection: number;
  fabric: AwningFabricKey;
  operation: AwningOperationKey;
  installation: AwningInstallationKey;
  color: AwningColorKey;
  extras: AwningExtraKey[];
}

export interface ConfigLineItem {
  label: string;
  amount: number;
}

export const awningOptions = {
  widths: [8, 10, 12, 14, 16, 18, 20].map((value) => ({
    value,
    label: `${value} ft`,
  })),
  projections: [6, 8, 10, 12, 14].map((value) => ({
    value,
    label: `${value} ft`,
  })),
  fabrics: [
    {
      id: "performance" as const,
      label: "Performance Alpine",
      description: "Best value for UV resistance and durability.",
      surcharge: 420,
    },
    {
      id: "sunscreen" as const,
      label: "SunScreen",
      description: "Light-filtering woven fabric for a softer look.",
      surcharge: 640,
    },
    {
      id: "luxury" as const,
      label: "Luxury Canvas",
      description: "Premium finish with enhanced color retention.",
      surcharge: 980,
    },
  ],
  operations: [
    { id: "manual" as const, label: "Manual crank", addition: 0 },
    { id: "motorized" as const, label: "Motorized", addition: 960 },
    { id: "smart" as const, label: "Smart + weather sensor", addition: 1680 },
  ],
  installations: [
    { id: "standard" as const, label: "Standard mount", addition: 0 },
    { id: "premium" as const, label: "Premium mount", addition: 820 },
    { id: "structural" as const, label: "Structural support", addition: 1800 },
  ],
  colors: [
    { id: "sandstone" as const, label: "Sandstone", swatch: "#D8C7A4" },
    { id: "charcoal" as const, label: "Charcoal", swatch: "#3F3F46" },
    { id: "ivory" as const, label: "Ivory", swatch: "#F5F1E8" },
    { id: "forest" as const, label: "Forest", swatch: "#1F5138" },
  ],
  extras: [
    { id: "windSensor" as const, label: "Wind sensor", price: 420 },
    { id: "valance" as const, label: "Valance strip", price: 240 },
    { id: "dropShade" as const, label: "Drop shade cassette", price: 680 },
    { id: "smartWeather" as const, label: "Weather automation", price: 520 },
  ],
} as const;

export function calculateRetractableAwningEstimate(config: RetractableAwningConfig) {
  const width = Number(config.width) || 12;
  const projection = Number(config.projection) || 10;
  const fabric = awningOptions.fabrics.find((item) => item.id === config.fabric) ?? awningOptions.fabrics[0];
  const operation = awningOptions.operations.find((item) => item.id === config.operation) ?? awningOptions.operations[0];
  const installation = awningOptions.installations.find((item) => item.id === config.installation) ?? awningOptions.installations[0];
  const extraItems: ConfigLineItem[] = [];
  for (const extraKey of config.extras ?? []) {
    const extra = awningOptions.extras.find((item) => item.id === extraKey);
    if (!extra) continue;
    extraItems.push({ label: extra.label, amount: extra.price });
  }

  const frameBase = width * 118 + projection * 54;
  const subtotal = frameBase + fabric.surcharge + operation.addition + installation.addition + extraItems.reduce((sum, item) => sum + item.amount, 0);
  const freight = width >= 16 ? 320 : 220;
  const installationLabor = subtotal * 0.12;
  const total = subtotal + freight + installationLabor;

  const recommendation =
    width >= 16 && projection >= 12
      ? "High-coverage configuration recommended for larger patios or dining areas."
      : width <= 12
        ? "Compact patio configuration is ideal for smaller spaces and faster installation."
        : "Balanced coverage configuration provides strong shade while retaining a clean profile.";

  return {
    width,
    projection,
    subtotal,
    freight,
    installationLabor,
    total,
    frameBase,
    recommendation,
    lineItems: [
      { label: "Frame & hardware", amount: frameBase },
      { label: `Fabric: ${fabric.label}`, amount: fabric.surcharge },
      { label: `Operation: ${operation.label}`, amount: operation.addition },
      { label: `Installation: ${installation.label}`, amount: installation.addition },
      ...extraItems,
      { label: "Freight", amount: freight },
      { label: "Installation labor", amount: installationLabor },
    ] as ConfigLineItem[],
  };
}

export function calculateSolarHeatGain({
  width,
  height,
  orientation,
  glazing,
  shadeFactor,
}: {
  width: number;
  height: number;
  orientation: "north" | "east" | "south" | "west";
  glazing: number;
  shadeFactor: number;
}) {
  const solarIntensity: Record<string, number> = {
    north: 0.7,
    east: 1.2,
    south: 0.9,
    west: 1.35,
  };

  const area = width * height;
  const baseGain = area * solarIntensity[orientation] * glazing * 15;
  const shadeReduction = Math.max(0, 1 - shadeFactor / 100);
  const estimatedGain = baseGain * (1 - shadeReduction * 0.9);

  return {
    area,
    baseGain,
    estimatedGain,
    shadeReduction,
    efficiency: Math.max(0, Math.min(100, 100 - (shadeReduction * 100) * 0.9)),
  };
}

export type CalculatorOrientationKey = "north" | "east" | "south" | "west";

export function calculateSizingAndProjection({
  width,
  projection,
  sunAngle,
  orientation,
  targetCoverage,
}: {
  width: number;
  projection: number;
  sunAngle: number;
  orientation: CalculatorOrientationKey;
  targetCoverage: number;
}) {
  const safeWidth = Math.max(6, Number(width) || 12);
  const safeProjection = Math.max(4, Number(projection) || 10);
  const safeSunAngle = Math.min(80, Math.max(15, Number(sunAngle) || 45));
  const safeCoverage = Math.min(95, Math.max(35, Number(targetCoverage) || 65));

  const orientationAdjustments: Record<CalculatorOrientationKey, number> = {
    north: 0.88,
    east: 1.04,
    south: 0.96,
    west: 1.12,
  };

  const sunFactor = Math.max(0.5, 1 - Math.abs(safeSunAngle - 45) / 60);
  const coverageRatio = (safeProjection / safeWidth) * 1.35;
  const projectedCoverage = Math.min(
    95,
    Math.max(
      35,
      (safeCoverage * 0.52 + coverageRatio * 60 + sunFactor * 24) * orientationAdjustments[orientation],
    ),
  );

  const recommendedProjection = Math.min(
    18,
    Math.max(6, Number((safeWidth * (safeCoverage / 100) * 0.9 + safeSunAngle / 8).toFixed(1))),
  );

  const product =
    projectedCoverage >= 75
      ? "Motorized projection awning"
      : projectedCoverage >= 55
        ? "Semi-fixed shade system"
        : "Compact shade panel";

  const recommendedWidth = Math.max(8, Math.min(30, safeWidth));

  return {
    area: safeWidth * safeProjection,
    coverage: Math.round(projectedCoverage),
    recommendedProjection,
    recommendedWidth,
    sunFactor: Number(sunFactor.toFixed(2)),
    product,
    shadeHours: Math.round(5 + projectedCoverage / 18 + (orientation === "west" ? 2 : 1)),
  };
}

export function calculateBudgetingTool({
  budget,
  area,
  productType,
  features,
  financingRate,
  financingTerm,
}: {
  budget: number;
  area: number;
  productType: "awning" | "pergola" | "screen" | "umbrella";
  features: Array<"motor" | "weather" | "lighting" | "drainage">;
  financingRate: number;
  financingTerm: number;
}) {
  const productBase: Record<typeof productType, number> = {
    awning: 4200,
    pergola: 9800,
    screen: 2500,
    umbrella: 1800,
  };

  const featureRates = {
    motor: 1400,
    weather: 850,
    lighting: 620,
    drainage: 520,
  } as const;

  const safeBudget = Math.max(1500, Number(budget) || 8000);
  const safeArea = Math.max(30, Number(area) || 180);
  const safeRate = Math.min(18, Math.max(0, Number(financingRate) || 7.9));
  const safeTerm = Math.min(120, Math.max(12, Number(financingTerm) || 84));

  const footprintFactor = 1 + safeArea / 350;
  const featureCost = features.reduce((sum, feature) => sum + featureRates[feature], 0);
  const subtotal = productBase[productType] * footprintFactor + featureCost;
  const designFee = subtotal * 0.08;
  const total = subtotal + designFee;

  const monthlyRate = safeRate / 100 / 12;
  const payment =
    monthlyRate > 0
      ? (total * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -safeTerm / 12))
      : total / (safeTerm / 12);

  const delta = safeBudget - total;
  const withinBudget = delta >= 0;
  const recommendedPackage =
    total <= safeBudget
      ? "Balanced package within budget"
      : "Priority package requires a larger budget or fewer upgrades";

  return {
    subtotal,
    designFee,
    total,
    monthlyPayment: Number(payment.toFixed(2)),
    withinBudget,
    delta: Number(delta.toFixed(2)),
    recommendedPackage,
    isProjectReady: total <= safeBudget * 0.96,
  };
}

export function calculateCommercialROI({
  annualEnergySpend,
  climateZone,
  usableDaysBefore,
  usableDaysAfter,
  projectCost,
  staffCount,
}: {
  annualEnergySpend: number;
  climateZone: "cool" | "temperate" | "hot";
  usableDaysBefore: number;
  usableDaysAfter: number;
  projectCost: number;
  staffCount: number;
}) {
  const safeSpend = Math.max(4000, Number(annualEnergySpend) || 50000);
  const climateMultipliers: Record<typeof climateZone, number> = {
    cool: 0.86,
    temperate: 1,
    hot: 1.28,
  };
  const safeUseBefore = Math.min(365, Math.max(0, Number(usableDaysBefore) || 210));
  const safeUseAfter = Math.min(365, Math.max(0, Number(usableDaysAfter) || 290));
  const safeCost = Math.max(1000, Number(projectCost) || 25000);
  const safeStaff = Math.max(1, Number(staffCount) || 18);

  const avoidedCooling = safeSpend * 0.16 * climateMultipliers[climateZone];
  const productivityGain = safeStaff * 180 * ((safeUseAfter - safeUseBefore) / 365) * 1.15;
  const annualSavings = avoidedCooling + productivityGain;
  const roi = (annualSavings / safeCost) * 100;
  const paybackMonths = safeCost / Math.max(annualSavings / 12, 1);
  const usableDayLift = Math.max(0, safeUseAfter - safeUseBefore);

  return {
    avoidedCooling: Number(avoidedCooling.toFixed(2)),
    productivityGain: Number(productivityGain.toFixed(2)),
    annualSavings: Number(annualSavings.toFixed(2)),
    roi: Number(roi.toFixed(1)),
    paybackMonths: Number(paybackMonths.toFixed(1)),
    usableDayLift,
    recommendation:
      roi >= 20
        ? "High-value shade investment with strong operating cost recovery."
        : roi >= 10
          ? "Balanced payback profile with moderate operational gain."
          : "Needs additional design tuning or a lower-cost package to meet the target ROI.",
  };
}

export function calculateWindLoad({
  windSpeed,
  exposure,
  height,
  span,
  productType,
}: {
  windSpeed: number;
  exposure: "sheltered" | "urban" | "coastal" | "open";
  height: number;
  span: number;
  productType: "awning" | "pergola" | "screen" | "umbrella";
}) {
  const safeWindSpeed = Math.max(15, Number(windSpeed) || 35);
  const safeHeight = Math.max(4, Number(height) || 9);
  const safeSpan = Math.max(4, Number(span) || 12);

  const exposureFactors: Record<typeof exposure, number> = {
    sheltered: 0.8,
    urban: 1,
    coastal: 1.25,
    open: 1.45,
  };

  const productFactors: Record<typeof productType, number> = {
    awning: 1.05,
    pergola: 1.2,
    screen: 0.9,
    umbrella: 0.75,
  };

  const dynamicPressure = 0.00256 * (safeWindSpeed ** 2) * exposureFactors[exposure] * productFactors[productType];
  const areaFactor = 1 + safeHeight / 30 + safeSpan / 80;
  const effectiveLoad = dynamicPressure * areaFactor;

  const ratingThresholds = {
    low: 20,
    medium: 35,
    high: 50,
  };

  const beaufortScale =
    safeWindSpeed < 18
      ? "Force 3: Gentle breeze"
      : safeWindSpeed < 31
        ? "Force 4: Moderate breeze"
        : safeWindSpeed < 39
          ? "Force 5: Fresh breeze"
          : safeWindSpeed < 55
            ? "Force 6: Strong breeze"
            : safeWindSpeed < 72
              ? "Force 7: Near gale"
              : "Force 8+: Gale force";

  const rating =
    effectiveLoad < ratingThresholds.low
      ? "Below standard rating"
      : effectiveLoad < ratingThresholds.medium
        ? "Standard-rated design"
        : effectiveLoad < ratingThresholds.high
          ? "Heavy-duty review recommended"
          : "Engineer review required";

  return {
    dynamicPressure: Number(dynamicPressure.toFixed(2)),
    effectiveLoad: Number(effectiveLoad.toFixed(2)),
    beaufort: beaufortScale,
    rating,
    threshold: ratingThresholds.high,
    recommendation:
      effectiveLoad < ratingThresholds.medium
        ? "Current selection is within a typical residential rating band."
        : effectiveLoad < ratingThresholds.high
          ? "Review mounting hardware and site exposure before release to production."
          : "This condition exceeds the standard risk threshold; engineer signoff is recommended.",
  };
}
