"use client";

import type { ChangeEventHandler } from "react";

interface Props {
  name?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function HoneypotField({ name = "website", value, onChange }: Props) {
  return (
    <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
      Leave this field blank
      <input name={name} type="text" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
    </label>
  );
}
