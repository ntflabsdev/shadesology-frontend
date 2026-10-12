"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getMaintenanceReminders,
  type MaintenanceReminder,
  type ReminderStatus,
} from "@/lib/maintenanceReminders";

const statusStyles: Record<ReminderStatus, string> = {
  "due-soon": "bg-amber-100 text-amber-800 border-amber-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  scheduled: "bg-sky-100 text-sky-700 border-sky-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const defaultForm = {
  product: "",
  service: "Seasonal inspection",
  dueDate: "",
  channel: "email" as "email" | "sms" | "portal",
  notes: "",
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? dateString
    : new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
}

function getDaysUntil(dateString: string) {
  const due = new Date(dateString).getTime();
  const diff = due - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function MaintenanceReminders() {
  const [reminders, setReminders] = useState<MaintenanceReminder[]>(() => getMaintenanceReminders());
  const [filter, setFilter] = useState<"all" | ReminderStatus>("all");
  const [form, setForm] = useState(defaultForm);

  const filteredReminders = useMemo(() => {
    if (filter === "all") return reminders;
    return reminders.filter((reminder) => reminder.status === filter);
  }, [filter, reminders]);

  const metrics = useMemo(() => {
    const dueSoon = reminders.filter((item) => item.status === "due-soon" || item.status === "overdue").length;
    const scheduled = reminders.filter((item) => item.status === "scheduled").length;
    const completed = reminders.filter((item) => item.status === "completed").length;
    return { dueSoon, scheduled, completed };
  }, [reminders]);

  function updateReminderStatus(id: string, nextStatus: ReminderStatus) {
    setReminders((current) =>
      current.map((reminder) =>
        reminder.id === id
          ? {
              ...reminder,
              status: nextStatus,
              summary:
                nextStatus === "completed"
                  ? "Service has been completed and logged in the customer maintenance history."
                  : reminder.summary,
            }
          : reminder,
      ),
    );
  }

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const productName = form.product.trim() || "Customer shade system";
    const dueDate = form.dueDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString().slice(0, 10);
    const status: ReminderStatus = getDaysUntil(dueDate) <= 14 ? "due-soon" : "scheduled";

    const newReminder: MaintenanceReminder = {
      id: `custom-${Date.now()}`,
      productName,
      productType: "Custom shade project",
      serviceType: form.service,
      dueDate,
      lastService: "Today",
      nextAction: form.notes.trim() || "Review the product, clean the surfaces and confirm all moving parts are operating normally.",
      recommendedInterval: "6 months",
      status,
      preferredChannel: form.channel,
      summary: "A custom maintenance reminder has been created from the support flow and is ready for staff review.",
      checklist: [
        "Inspect the project for wear or debris",
        "Review moving parts and fasteners",
        "Confirm the final service note is logged",
      ],
    };

    setReminders((current) => [newReminder, ...current]);
    setFilter("all");
    setForm(defaultForm);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="space-y-6">
        <div className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-md)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">Maintenance reminders</p>
              <h2 className="mt-2 text-3xl font-bold text-[--color-text-primary]">Proactive care plan</h2>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => setFilter("all")}>
              Refresh view
            </Button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[--color-border] bg-[--color-neutral-50] p-4">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Due soon</p>
              <p className="mt-2 text-2xl font-bold text-[--color-text-primary]">{metrics.dueSoon}</p>
            </div>
            <div className="rounded-2xl border border-[--color-border] bg-[--color-neutral-50] p-4">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Scheduled</p>
              <p className="mt-2 text-2xl font-bold text-[--color-text-primary]">{metrics.scheduled}</p>
            </div>
            <div className="rounded-2xl border border-[--color-border] bg-[--color-neutral-50] p-4">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Completed</p>
              <p className="mt-2 text-2xl font-bold text-[--color-text-primary]">{metrics.completed}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-bold text-[--color-text-primary]">Reminder list</h3>
            <div className="flex flex-wrap gap-2">
              {(["all", "due-soon", "scheduled", "overdue", "completed"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                    filter === value
                      ? "border-[--color-brand-primary] bg-[--color-brand-primary] text-white"
                      : "border-[--color-border] bg-white text-[--color-text-muted] hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]"
                  }`}
                >
                  {value === "all" ? "All" : value.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {filteredReminders.map((reminder) => {
              const daysUntil = getDaysUntil(reminder.dueDate);

              return (
                <article key={reminder.id} className="rounded-2xl border border-[--color-border] bg-[--color-neutral-50] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">{reminder.productType}</p>
                      <h4 className="mt-1 text-xl font-bold text-[--color-text-primary]">{reminder.productName}</h4>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusStyles[reminder.status]}`}>
                      {reminder.status}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-[--color-text-muted]">{reminder.summary}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Service</p>
                      <p className="mt-1 text-sm font-semibold text-[--color-text-primary]">{reminder.serviceType}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Due date</p>
                      <p className="mt-1 text-sm font-semibold text-[--color-text-primary]">{formatDate(reminder.dueDate)}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Window</p>
                      <p className="mt-1 text-sm font-semibold text-[--color-text-primary]">{daysUntil} days</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[--color-text-muted]">Channel</p>
                      <p className="mt-1 text-sm font-semibold capitalize text-[--color-text-primary]">{reminder.preferredChannel}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-white p-4">
                    <p className="text-sm font-semibold text-[--color-text-primary]">Recommended action</p>
                    <p className="mt-2 text-sm text-[--color-text-muted]">{reminder.nextAction}</p>
                    <ul className="mt-4 space-y-2 text-sm text-[--color-text-muted]">
                      {reminder.checklist.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span aria-hidden="true">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="button" variant="secondary" size="sm" onClick={() => updateReminderStatus(reminder.id, "completed")}>
                      Mark complete
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => updateReminderStatus(reminder.id, "scheduled")}>
                      Schedule again
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl border border-[--color-border] bg-white p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-xl font-bold text-[--color-text-primary]">Set a reminder</h3>
          <p className="mt-2 text-sm text-[--color-text-muted]">
            Keep maintenance windows aligned to product care guidance and customer consent.
          </p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-[--color-text-primary]">
              Product / project name
              <input
                name="product"
                value={form.product}
                onChange={handleChange}
                placeholder="Example: Patio awning"
                className="mt-2 w-full rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>

            <label className="block text-sm font-medium text-[--color-text-primary]">
              Service type
              <input
                name="service"
                value={form.service}
                onChange={handleChange}
                placeholder="Seasonal inspection"
                className="mt-2 w-full rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-[--color-text-primary]">
                Due date
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
                />
              </label>

              <label className="block text-sm font-medium text-[--color-text-primary]">
                Reminder channel
                <select
                  name="channel"
                  value={form.channel}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="portal">Portal</option>
                </select>
              </label>
            </div>

            <label className="block text-sm font-medium text-[--color-text-primary]">
              Notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add service notes or a product-specific instruction."
                className="mt-2 w-full rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
              />
            </label>

            <Button type="submit" className="w-full" size="lg">
              Save maintenance reminder
            </Button>
          </form>
        </div>

        <div className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-6 shadow-[var(--shadow-sm)]">
          <h3 className="text-xl font-bold text-[--color-text-primary]">Operational notes</h3>
          <ul className="mt-4 space-y-3 text-sm text-[--color-text-muted]">
            <li className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>Reminders are shown only when the customer has consented to service communication.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>Checklist items stay grounded in product-specific maintenance guidance and care instructions.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden="true">•</span>
              <span>Completed tasks are retained in the account history for future follow-up and warranty checks.</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
