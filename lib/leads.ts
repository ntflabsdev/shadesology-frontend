const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export interface LeadSubmissionResult {
  message: string;
  data?: { reference?: string };
}

export async function submitLead(
  endpoint: "leads" | "contact" | "warranty/register",
  payload: object,
): Promise<LeadSubmissionResult> {
  const response = await fetch(`${BASE}/api/content/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result: unknown = await response.json().catch(() => null);
  const responseBody = result && typeof result === "object" ? result as Record<string, unknown> : {};
  if (!response.ok) {
    throw new Error(typeof responseBody.message === "string" ? responseBody.message : "Your request could not be submitted.");
  }
  const rawData = responseBody.data && typeof responseBody.data === "object" ? responseBody.data as Record<string, unknown> : undefined;
  return {
    message: typeof responseBody.message === "string" ? responseBody.message : "Your request has been received.",
    data: typeof rawData?.reference === "string" ? { reference: rawData.reference } : undefined,
  };
}
