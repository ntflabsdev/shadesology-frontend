"use client";

import { useState } from "react";
import { submitCommercialEnquiry, uploadCommercialDrawing } from "@/lib/api";

const AUDIENCES = [
  "Architects and specifiers",
  "Builders, developers and property managers",
  "Government, healthcare and hospitality",
];
const PROJECT_TYPES = [
  "Hospitality",
  "Restaurant or cafe",
  "Retail",
  "Office",
  "Healthcare",
  "Education",
  "Government",
  "Property management",
  "Other",
];
const MAX_FILES = 10;
const MAX_FILE_BYTES = 100 * 1024 * 1024;

export function CommercialProjectEnquiryForm({ initialAudience = "" }: { initialAudience?: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");
    const form = event.currentTarget;
    const values = new FormData(form);
    const firstName = String(values.get("firstName") || "").trim();
    const lastName = String(values.get("lastName") || "").trim();
    setSubmitting(true);
    try {
      const attachments = [];
      for (const file of files) attachments.push(await uploadCommercialDrawing(file));
      const result = await submitCommercialEnquiry({
        email: String(values.get("email") || "").trim(),
        phone: String(values.get("phone") || "").trim(),
        company: String(values.get("company") || "").trim(),
        region: String(values.get("state") || "").trim(),
        message: String(values.get("projectDescription") || "").trim(),
        productType: String(values.get("projectType") || ""),
        data: {
          firstName,
          lastName,
          businessName: String(values.get("company") || "").trim(),
          audience: String(values.get("audience") || ""),
          projectType: String(values.get("projectType") || ""),
          city: String(values.get("city") || "").trim(),
          state: String(values.get("state") || "").trim(),
          timeline: String(values.get("timeline") || ""),
          budget: String(values.get("budget") || ""),
          projectDescription: String(values.get("projectDescription") || "").trim(),
        },
        attachments,
      });
      setNotice(`Thanks — your commercial project enquiry was received. Reference: ${result.reference}`);
      form.reset();
      setFiles([]);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Could not submit your project enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  function updateFiles(selection: FileList | null) {
    const selected = Array.from(selection || []);
    if (selected.length > MAX_FILES) {
      setError(`Choose no more than ${MAX_FILES} project files.`);
      return;
    }
    const oversized = selected.find((file) => file.size > MAX_FILE_BYTES);
    if (oversized) {
      setError(`${oversized.name} is larger than the 100 MB per-file limit.`);
      return;
    }
    setError("");
    setFiles(selected);
  }

  const field = "mt-1 w-full rounded-lg border border-[--color-border] bg-white px-3 py-2.5";
  return (
    <form onSubmit={submit} className="space-y-5" aria-describedby="commercial-form-help">
      <p id="commercial-form-help" className="text-sm text-[--color-text-muted]">
        Tell us about the project. Drawings and photos are uploaded to private storage and are not publicly accessible.
      </p>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">First name<input className={field} name="firstName" required maxLength={100} autoComplete="given-name" /></label>
        <label className="text-sm font-medium">Last name<input className={field} name="lastName" required maxLength={100} autoComplete="family-name" /></label>
        <label className="text-sm font-medium">Work email<input className={field} name="email" type="email" required maxLength={254} autoComplete="email" /></label>
        <label className="text-sm font-medium">Phone<input className={field} name="phone" type="tel" maxLength={40} autoComplete="tel" /></label>
        <label className="text-sm font-medium">Company<input className={field} name="company" required maxLength={200} autoComplete="organization" /></label>
        <label className="text-sm font-medium">I am a<select className={field} name="audience" defaultValue={initialAudience} required><option value="">Select your role</option>{AUDIENCES.map((audience) => <option key={audience}>{audience}</option>)}</select></label>
        <label className="text-sm font-medium">Project type<select className={field} name="projectType" required defaultValue=""><option value="">Select a project type</option>{PROJECT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label className="text-sm font-medium">Project city<input className={field} name="city" maxLength={100} autoComplete="address-level2" /></label>
        <label className="text-sm font-medium">State / region<input className={field} name="state" maxLength={100} autoComplete="address-level1" /></label>
        <label className="text-sm font-medium">Target timeline<select className={field} name="timeline" defaultValue=""><option value="">Select if known</option><option>0–3 months</option><option>3–6 months</option><option>6–12 months</option><option>12+ months</option><option>Not sure</option></select></label>
        <label className="text-sm font-medium">Estimated budget<select className={field} name="budget" defaultValue=""><option value="">Select if known</option><option>Under $25,000</option><option>$25,000–$100,000</option><option>$100,000–$500,000</option><option>$500,000+</option><option>Not sure</option></select></label>
      </div>
      <label className="block text-sm font-medium">Project details
        <textarea className={`${field} min-h-32`} name="projectDescription" required minLength={10} maxLength={5000} />
      </label>
      <label className="block text-sm font-medium">Drawings, plans or site photos
        <input
          className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-[--color-neutral-100] file:px-3 file:py-2`}
          type="file"
          multiple
          accept=".pdf,.dwg,.dxf,.zip,.doc,.docx,.jpg,.jpeg,.png,.webp"
          onChange={(event) => updateFiles(event.currentTarget.files)}
        />
        <span className="mt-1 block text-xs font-normal text-[--color-text-muted]">Up to {MAX_FILES} files, 100 MB each.</span>
      </label>
      {files.length > 0 && <p className="text-sm text-[--color-text-muted]">{files.length} file(s) selected: {files.map((file) => file.name).join(", ")}</p>}
      <button disabled={submitting} className="rounded-xl bg-[--color-brand-primary] px-6 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-60">
        {submitting ? "Sending enquiry…" : "Send project enquiry"}
      </button>
    </form>
  );
}
