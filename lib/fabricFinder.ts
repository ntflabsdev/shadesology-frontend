export type FabricComposition = "PVC" | "Polyester" | "Acrylic" | "Olefin";
export type FabricOpenness = "Open" | "Semi-open" | "Closed";

export interface FabricEntry {
  id: string;
  name: string;
  manufacturer: string;
  composition: FabricComposition;
  openness: FabricOpenness;
  warrantyYears: number;
  solarTransmission: number;
  solarReflectance: number;
  color: string;
  pattern: "Solid" | "Weave" | "Textured" | "Striped";
  group: "Awnings" | "Pergolas" | "Sails" | "Screens" | "Pool Covers";
  suitableFor: string[];
  image: string;
  pricePerSqFt: number;
  availability: {
    awnings: boolean;
    pergolas: boolean;
    sails: boolean;
    screens: boolean;
    poolCovers: boolean;
  };
}

export const fabricData: FabricEntry[] = [
  {
    id: "alpine-performance",
    name: "Alpine Performance",
    manufacturer: "Shadesology Studio",
    composition: "PVC",
    openness: "Closed",
    warrantyYears: 10,
    solarTransmission: 16,
    solarReflectance: 62,
    color: "Sandstone",
    pattern: "Textured",
    group: "Awnings",
    suitableFor: ["Patio cover", "Poolside", "Commercial fascia"],
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
    pricePerSqFt: 8.8,
    availability: { awnings: true, pergolas: true, sails: false, screens: false, poolCovers: false },
  },
  {
    id: "sun-block-elite",
    name: "SunBlock Elite",
    manufacturer: "Northline Textiles",
    composition: "Acrylic",
    openness: "Semi-open",
    warrantyYears: 12,
    solarTransmission: 23,
    solarReflectance: 57,
    color: "Driftwood",
    pattern: "Weave",
    group: "Pergolas",
    suitableFor: ["Outdoor dining", "Garden retreat", "Residential pergola"],
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    pricePerSqFt: 10.6,
    availability: { awnings: true, pergolas: true, sails: true, screens: false, poolCovers: false },
  },
  {
    id: "lattice-veil",
    name: "Lattice Veil",
    manufacturer: "Horizon Weaves",
    composition: "Polyester",
    openness: "Open",
    warrantyYears: 8,
    solarTransmission: 41,
    solarReflectance: 48,
    color: "Charcoal",
    pattern: "Striped",
    group: "Sails",
    suitableFor: ["Shade sail", "Garden screening", "Facade layering"],
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
    pricePerSqFt: 7.4,
    availability: { awnings: false, pergolas: true, sails: true, screens: true, poolCovers: false },
  },
  {
    id: "sail-pulse",
    name: "Sail Pulse",
    manufacturer: "Coastal Loom",
    composition: "Olefin",
    openness: "Semi-open",
    warrantyYears: 9,
    solarTransmission: 28,
    solarReflectance: 60,
    color: "Ivory",
    pattern: "Solid",
    group: "Screens",
    suitableFor: ["Privacy screen", "Wind protection", "Balcony"],
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
    pricePerSqFt: 9.2,
    availability: { awnings: false, pergolas: true, sails: true, screens: true, poolCovers: false },
  },
  {
    id: "harbor-rib",
    name: "Harbor Rib",
    manufacturer: "Harbor Works",
    composition: "PVC",
    openness: "Closed",
    warrantyYears: 15,
    solarTransmission: 12,
    solarReflectance: 68,
    color: "Forest",
    pattern: "Textured",
    group: "Pool Covers",
    suitableFor: ["Pool cover", "High UV control", "Water retention"],
    image: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=900&q=80",
    pricePerSqFt: 12.5,
    availability: { awnings: false, pergolas: false, sails: false, screens: false, poolCovers: true },
  },
  {
    id: "terra-linen",
    name: "Terra Linen",
    manufacturer: "Field & Frame",
    composition: "Acrylic",
    openness: "Open",
    warrantyYears: 11,
    solarTransmission: 35,
    solarReflectance: 52,
    color: "Sand",
    pattern: "Weave",
    group: "Pergolas",
    suitableFor: ["Exterior shading", "Decorative pergola", "Open-air lounge"],
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
    pricePerSqFt: 9.8,
    availability: { awnings: true, pergolas: true, sails: true, screens: false, poolCovers: false },
  },
];

export const fabricFilterOptions = {
  compositions: ["PVC", "Polyester", "Acrylic", "Olefin"] as const,
  openness: ["Open", "Semi-open", "Closed"] as const,
  patterns: ["Solid", "Weave", "Textured", "Striped"] as const,
  groups: ["Awnings", "Pergolas", "Sails", "Screens", "Pool Covers"] as const,
};
