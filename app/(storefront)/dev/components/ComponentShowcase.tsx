"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { RadioGroup } from "@/components/ui/Radio";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui/Card";
import { DataTable } from "@/components/ui/DataTable";
import { SpecTable } from "@/components/ui/SpecTable";
import { List } from "@/components/ui/List";
import { Modal } from "@/components/ui/Modal";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold text-[--color-text-primary] mb-4 pb-2 border-b border-[--color-border]">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Sample data ─────────────────────────────────────────────────────────────
const TABLE_COLS = [
  { key: "name",  header: "Product" },
  { key: "price", header: "Price", align: "right" as const, render: (v: unknown) => `$${v}` },
  { key: "stock", header: "Stock", render: (v: unknown) => (
    <span className={`font-medium ${v === "In Stock" ? "text-green-700" : "text-amber-700"}`}>{String(v)}</span>
  )},
];

const TABLE_DATA = [
  { name: "Weinor Cassita II", price: 2499, stock: "In Stock" },
  { name: "Sunray Pergola 4000", price: 8999, stock: "Made to Order" },
  { name: "Shade Sail 5m×5m", price: 1299, stock: "In Stock" },
];

const SPEC_DATA = [
  { label: "Width Range", value: "8 ft – 49 ft" },
  { label: "Projection Range", value: "4 ft – 14 ft" },
  { label: "Frame Material", value: "Extruded Aluminium" },
  { label: "Operation", value: "Motorized (Somfy)" },
  { label: "Wind Rating", value: "Beaufort 5 (38 mph)" },
  { label: "Warranty", value: "5 years frame / 3 years fabric" },
];

export function ComponentShowcase() {
  // Modal + Drawer state
  const [modalOpen,  setModalOpen]  = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSide, setDrawerSide] = useState<"left" | "right" | "bottom">("right");

  // Form state
  const [inputVal,    setInputVal]    = useState("");
  const [selectVal,   setSelectVal]   = useState("");
  const [radioVal,    setRadioVal]    = useState("");
  const [checkVal,    setCheckVal]    = useState(false);
  const [textareaVal, setTextareaVal] = useState("");

  const { toast } = useToast();

  return (
    <main className="container py-12" id="main-content">
      <h1 className="text-3xl font-bold text-[--color-text-primary] mb-2">
        Design System Showcase
      </h1>
      <p className="text-[--color-text-muted] mb-10">
        Every component below must be operable by keyboard (Tab / Shift+Tab / Enter / Space / Escape).
        Only rendered in development.
      </p>

      {/* ── Buttons ─────────────────────────────────────────────────────── */}
      <Section title="Button">
        <div className="flex flex-wrap gap-3 mb-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
        <div className="flex flex-wrap gap-3 mb-4">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button isLoading>Loading…</Button>
          <Button disabled>Disabled</Button>
          <Button href="/products" variant="outline">Link Button</Button>
        </div>
      </Section>

      {/* ── Badge ──────────────────────────────────────────────────────── */}
      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          {["default", "success", "warning", "error", "info", "brand"].map((v) => (
            <Badge key={v} variant={v as Parameters<typeof Badge>[0]["variant"]}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </Badge>
          ))}
        </div>
      </Section>

      {/* ── Input ──────────────────────────────────────────────────────── */}
      <Section title="Input">
        <div className="grid gap-4 max-w-lg">
          <Input
            label="Full name"
            placeholder="Jane Smith"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="jane@example.com"
            hint="We'll never share your email."
          />
          <Input
            label="Password"
            type="password"
            error="Password must be at least 8 characters."
          />
          <Input
            label="Price"
            type="number"
            leftAddon="$"
            placeholder="0.00"
          />
          <Input label="Disabled" value="Cannot edit this" disabled />
        </div>
      </Section>

      {/* ── Select ─────────────────────────────────────────────────────── */}
      <Section title="Select">
        <div className="max-w-xs">
          <Select
            label="Product type"
            placeholder="Choose a type…"
            value={selectVal}
            onChange={(e) => setSelectVal(e.target.value)}
            options={[
              { value: "awning",   label: "Retractable Awning" },
              { value: "pergola",  label: "Fabric Pergola" },
              { value: "louvered", label: "Louvered Roof" },
              { value: "sail",     label: "Shade Sail" },
            ]}
          />
          <p className="mt-2 text-sm text-[--color-text-muted]">
            Selected: <strong>{selectVal || "none"}</strong>
          </p>
        </div>
      </Section>

      {/* ── Checkbox ───────────────────────────────────────────────────── */}
      <Section title="Checkbox">
        <div className="flex flex-col gap-3 max-w-sm">
          <Checkbox
            label="I agree to the terms and conditions"
            checked={checkVal}
            onChange={(e) => setCheckVal(e.target.checked)}
          />
          <Checkbox
            label="Send me product updates"
            hint="Maximum one email per week."
          />
          <Checkbox label="Disabled option" disabled />
          <Checkbox
            label="Invalid choice"
            error="This field is required."
          />
        </div>
      </Section>

      {/* ── Radio ──────────────────────────────────────────────────────── */}
      <Section title="RadioGroup">
        <RadioGroup
          name="operation"
          label="Operation type"
          value={radioVal}
          onChange={setRadioVal}
          options={[
            { value: "manual",    label: "Manual",    hint: "Crank handle operated" },
            { value: "motorized", label: "Motorized", hint: "Somfy RTS motor included" },
            { value: "smart",     label: "Smart / App-Controlled" },
            { value: "disabled",  label: "Unavailable option", disabled: true },
          ]}
        />
        <p className="mt-2 text-sm text-[--color-text-muted]">
          Selected: <strong>{radioVal || "none"}</strong>
        </p>
      </Section>

      {/* ── Textarea ───────────────────────────────────────────────────── */}
      <Section title="Textarea">
        <div className="max-w-lg">
          <Textarea
            label="Project description"
            placeholder="Tell us about your project…"
            value={textareaVal}
            onChange={(e) => setTextareaVal(e.target.value)}
            hint={`${textareaVal.length} / 500 characters`}
            rows={5}
          />
        </div>
      </Section>

      {/* ── Card ───────────────────────────────────────────────────────── */}
      <Section title="Card">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[--color-text-primary]">Default Card</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-[--color-text-muted]">
                Standard card with header, body and footer slots.
              </p>
            </CardBody>
            <CardFooter>
              <Button size="sm" variant="outline">Action</Button>
            </CardFooter>
          </Card>
          <Card hoverable>
            <CardBody>
              <h3 className="font-semibold text-[--color-text-primary] mb-1">Hoverable</h3>
              <p className="text-sm text-[--color-text-muted]">Lifts on hover / focus.</p>
            </CardBody>
          </Card>
          <Card noPadding>
            <div className="h-24 bg-[--color-neutral-100] rounded-t-xl" />
            <div className="p-4">
              <p className="text-sm font-medium">No-padding card</p>
            </div>
          </Card>
        </div>
      </Section>

      {/* ── List ───────────────────────────────────────────────────────── */}
      <Section title="List">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Unordered (checkmark icon)</p>
            <List
              items={[
                "Full cassette fabric protection",
                "Available motorized or manual",
                "5-year frame warranty",
                "Made in Germany",
              ]}
            />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Ordered</p>
            <List
              ordered
              items={[
                "Measure your space",
                "Choose your fabric",
                "Select operation type",
                "Add to quote",
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ── DataTable ──────────────────────────────────────────────────── */}
      <Section title="DataTable">
        <DataTable
          columns={TABLE_COLS}
          data={TABLE_DATA}
          rowKey={(r) => r.name}
          caption="Sample product catalog"
        />
      </Section>

      {/* ── SpecTable ──────────────────────────────────────────────────── */}
      <Section title="SpecTable">
        <SpecTable data={SPEC_DATA} caption="Weinor Cassita II specifications" />
      </Section>

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      <Section title="Toast">
        <div className="flex flex-wrap gap-3">
          {(["success", "error", "warning", "info"] as const).map((v) => (
            <Button
              key={v}
              variant="outline"
              onClick={() =>
                toast({
                  title: `${v.charAt(0).toUpperCase() + v.slice(1)} toast`,
                  description: "This dismisses after 5 seconds.",
                  variant: v,
                })
              }
            >
              Show {v}
            </Button>
          ))}
          <Button
            variant="ghost"
            onClick={() =>
              toast({
                title: "Persistent toast",
                description: "This will not auto-dismiss. Click ✕ to close.",
                variant: "info",
                duration: 0,
              })
            }
          >
            Persistent
          </Button>
        </div>
      </Section>

      {/* ── Modal ──────────────────────────────────────────────────────── */}
      <Section title="Modal">
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Request a Quote"
          description="Fill in the form below and our team will respond within 1 business day."
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={() => { setModalOpen(false); toast({ title: "Quote submitted!", variant: "success" }); }}>
                Submit Quote
              </Button>
            </div>
          }
        >
          <div className="grid gap-4">
            <Input label="Full name" required />
            <Input label="Email" type="email" required />
            <Textarea label="Project details" rows={3} />
          </div>
        </Modal>
      </Section>

      {/* ── Drawer ─────────────────────────────────────────────────────── */}
      <Section title="Drawer">
        <div className="flex flex-wrap gap-3">
          {(["right", "left", "bottom"] as const).map((side) => (
            <Button
              key={side}
              variant="outline"
              onClick={() => { setDrawerSide(side); setDrawerOpen(true); }}
            >
              Open {side} drawer
            </Button>
          ))}
        </div>
        <Drawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Filter Products"
          side={drawerSide}
          footer={
            <div className="flex gap-2">
              <Button fullWidth variant="ghost" onClick={() => setDrawerOpen(false)}>Clear</Button>
              <Button fullWidth onClick={() => { setDrawerOpen(false); toast({ title: "Filters applied", variant: "success" }); }}>
                Apply
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input label="Width (ft)" type="number" />
            <Select
              label="Mount type"
              options={[
                { value: "wall",    label: "Wall mount" },
                { value: "ceiling", label: "Ceiling mount" },
              ]}
            />
            <RadioGroup
              name="operation-drawer"
              label="Operation"
              options={[
                { value: "manual",    label: "Manual" },
                { value: "motorized", label: "Motorized" },
              ]}
            />
          </div>
        </Drawer>
      </Section>
    </main>
  );
}
