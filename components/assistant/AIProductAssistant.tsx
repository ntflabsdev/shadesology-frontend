"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { answerSupportQuestion, assistantQuickPrompts } from "@/lib/aiSupportAssistant";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "I can help with product fit, installation paths, support guidance and catalog-safe recommendations. Ask about awnings, pergolas, screens, lead times or installation next steps.",
  },
];

export function AIProductAssistant() {
  const [selectedPhoto, setSelectedPhoto] = useState<string>(
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  );
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState("");

  const responseSummary = useMemo(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      return last.content.slice(0, 120);
    }
    return "Ready to help with your project.";
  }, [messages]);

  const handleSubmit = (value?: string) => {
    const currentQuestion = (value ?? input).trim();
    if (!currentQuestion) return;

    const userMessage: ChatMessage = { role: "user", content: currentQuestion };
    const answer = answerSupportQuestion(currentQuestion);
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: `${answer.answer} ${answer.guardrails[0] ?? ""}`.trim(),
    };

    setMessages((existing) => [...existing, userMessage, assistantMessage]);
    setInput("");
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr_1.45fr]">
      <aside className="space-y-6">
        <div className="rounded-3xl border border-[--color-border] bg-[--color-neutral-50] p-5 shadow-[var(--shadow-sm)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-[--color-text-primary]">Property context</h2>
            <span className="rounded-full bg-[--color-brand-primary]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">
              Design-aware
            </span>
          </div>

          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[--color-border] bg-white px-4 py-5 text-sm font-medium text-[--color-brand-primary] hover:border-[--color-brand-primary]">
            Upload photo for project context
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </label>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[--color-border] bg-white">
            <img src={selectedPhoto} alt="Uploaded property context" className="h-56 w-full object-cover" />
          </div>

          <div className="mt-5 rounded-2xl border border-[--color-border] bg-white p-4">
            <p className="text-sm font-semibold text-[--color-text-primary]">Response safeguards</p>
            <ul className="mt-3 space-y-2 text-sm text-[--color-text-muted]">
              <li>• Answers only from catalog, FAQ and policy content.</li>
              <li>• Refuses invented wind ratings or unsupported sizes.</li>
              <li>• Escalates mechanical or engineering review when needed.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-[--color-border] bg-white p-5 shadow-[var(--shadow-sm)]">
          <h2 className="text-xl font-bold text-[--color-text-primary]">Quick prompts</h2>
          <div className="mt-4 space-y-2">
            {assistantQuickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSubmit(prompt)}
                className="block w-full rounded-xl border border-[--color-border] bg-[--color-neutral-50] px-3 py-2 text-left text-sm text-[--color-text-primary] transition hover:border-[--color-brand-primary] hover:text-[--color-brand-primary]"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="rounded-3xl border border-[--color-border] bg-white p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[--color-border] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[--color-brand-primary]">AI design assistant</p>
            <h2 className="mt-2 text-2xl font-bold text-[--color-text-primary]">Shadesology assistant</h2>
          </div>
          <div className="rounded-full bg-[--color-brand-primary]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[--color-brand-primary]">
            Catalog-safe mode
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[--color-neutral-50] p-4">
          <p className="text-sm text-[--color-text-muted]">Latest answer summary</p>
          <p className="mt-2 text-sm font-medium text-[--color-text-primary]">{responseSummary}</p>
        </div>

        <div className="mt-5 space-y-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "assistant"
                  ? "ml-0 bg-[--color-neutral-50] text-[--color-text-primary]"
                  : "ml-auto bg-[--color-brand-primary] text-white"
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-[--color-border] pt-4">
          <label className="mb-2 block text-sm font-medium text-[--color-text-primary]">Ask a question</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSubmit();
              }}
              placeholder="Ask about awnings, installation, fabric care, quotes or support..."
              className="w-full rounded-xl border border-[--color-border] px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-brand-accent]"
            />
            <Button type="button" onClick={() => handleSubmit()} size="lg" className="shrink-0">
              Send
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
