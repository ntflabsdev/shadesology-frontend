const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface FinancingOffer {
  _id: string;
  name: string;
  offerType: "representative_apr" | "deferred_interest";
  apr: number;
  standardApr?: number | null;
  termMonths: number;
  minimumAmount: number;
  maximumAmount?: number | null;
  lenderDisclosure: string;
  startsAt: string;
  endsAt: string;
}

export interface FinancingOptions {
  provider: string;
  mode: "sandbox" | "live";
  applicationAvailable: boolean;
  offers: FinancingOffer[];
  representativeApr: number;
  representativeTermMonths: number;
  representativeDisclosure: string;
}

export interface FinancingApplicationStatus {
  reference: string;
  applicationType: "consumer" | "commercial_lease";
  status: "started" | "prequalified" | "approved" | "declined" | "abandoned" | "handoff_unavailable";
  requestedAmount: number;
  approvedAmount?: number;
  providerReference?: string;
  createdAt: string;
}

async function financingRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}/api/financing${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || "Financing service is unavailable.");
  return json.data as T;
}

export async function getFinancingOptions(amount?: number): Promise<FinancingOptions> {
  const query = amount == null ? "" : `?amount=${encodeURIComponent(amount.toFixed(2))}`;
  return financingRequest<FinancingOptions>(`/options${query}`);
}

export async function createFinancingApplication(payload: {
  firstName: string;
  lastName: string;
  email: string;
  amount: number;
  consent: true;
}): Promise<{ reference: string; status: string; redirectUrl: string; mode: string }> {
  return financingRequest("/applications", { method: "POST", body: JSON.stringify(payload) });
}

export async function createLeaseApplication(payload: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  amount: number;
  consent: true;
}): Promise<{ reference: string; message: string }> {
  return financingRequest("/lease-applications", { method: "POST", body: JSON.stringify(payload) });
}

export async function getFinancingApplication(reference: string): Promise<FinancingApplicationStatus> {
  return financingRequest(`/applications/${encodeURIComponent(reference)}`);
}

export function calculateMonthlyPayment(principal: number, annualAprPercent: number, termMonths: number): number {
  if (!Number.isFinite(principal) || principal <= 0 || !Number.isFinite(annualAprPercent) ||
    annualAprPercent < 0 || annualAprPercent > 100 || !Number.isInteger(termMonths) ||
    termMonths < 1 || termMonths > 360) return 0;
  const monthlyRate = annualAprPercent / 100 / 12;
  const amount = monthlyRate === 0
    ? principal / termMonths
    : principal * monthlyRate / (1 - ((1 + monthlyRate) ** -termMonths));
  return Math.round(amount * 100) / 100;
}
