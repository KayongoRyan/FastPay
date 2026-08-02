export const BUSINESS_TYPES = [
  "retail",
  "garage",
  "construction",
  "hospitality",
  "restaurant",
  "wholesale",
  "transport",
  "agriculture",
  "manufacturing",
  "healthcare",
  "education",
  "professional_services",
  "technology",
  "real_estate",
  "other",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export type BusinessTypeOption = {
  value: BusinessType;
  label: string;
  hint: string;
};

export const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  { value: "retail", label: "Retail shop", hint: "Shops, kiosks, general merchandise" },
  { value: "garage", label: "Garage / auto workshop", hint: "Repairs, spare parts, service bays" },
  { value: "construction", label: "Construction company", hint: "Builders, contractors, materials" },
  { value: "hospitality", label: "Hotel / hospitality", hint: "Hotels, lodges, guest houses" },
  { value: "restaurant", label: "Restaurant / café", hint: "Food service, bars, bakeries" },
  { value: "wholesale", label: "Wholesale / distribution", hint: "Bulk trade and supply" },
  { value: "transport", label: "Transport / logistics", hint: "Fleet, courier, freight" },
  { value: "agriculture", label: "Agriculture / agribusiness", hint: "Farms, cooperatives, agro-trade" },
  { value: "manufacturing", label: "Manufacturing", hint: "Production and processing" },
  { value: "healthcare", label: "Healthcare / clinic", hint: "Clinics, pharmacies, labs" },
  { value: "education", label: "Education / training", hint: "Schools, tutoring, training centres" },
  { value: "professional_services", label: "Professional services", hint: "Legal, accounting, consulting" },
  { value: "technology", label: "Technology / IT", hint: "Software, ISP, tech support" },
  { value: "real_estate", label: "Real estate", hint: "Property sales, rentals, agency" },
  { value: "other", label: "Other", hint: "Describe your industry in the next step" },
];

export function businessTypeLabel(value?: string | null): string {
  if (!value) return "—";
  return BUSINESS_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export const COUNTRY_OPTIONS = [
  { value: "RW", label: "Rwanda" },
  { value: "KE", label: "Kenya" },
  { value: "UG", label: "Uganda" },
  { value: "TZ", label: "Tanzania" },
  { value: "BI", label: "Burundi" },
  { value: "CD", label: "DR Congo" },
  { value: "OTHER", label: "Other" },
] as const;
