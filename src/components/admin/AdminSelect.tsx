"use client";

import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  disabled?: boolean;
};

export default function AdminSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <label className="block text-sm mb-1 text-white/80">{label}</label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-md border border-white/15 bg-white/10 px-3 py-2 text-left text-white hover:border-white/30 disabled:opacity-60"
      >
        {selected?.label ?? "Select..."}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-md border border-white/10 bg-neutral-900 shadow-xl">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-sm transition ${
                value === opt.value
                  ? "bg-white text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}