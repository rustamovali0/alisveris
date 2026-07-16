"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type CustomSelectOption = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  value: string;
  options: CustomSelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
};

export function CustomSelect({
  value,
  options,
  placeholder = "Seçin",
  onChange,
  ariaLabel,
  name,
  disabled,
  className,
  buttonClassName,
  menuClassName,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      {name ? <input name={name} type="hidden" value={value} /> : null}
      <button
        aria-expanded={open}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-left text-sm outline-none transition hover:border-primary/50 focus:border-primary focus:ring-4 focus:ring-primary/10",
          !selected && "text-muted",
          disabled && "cursor-not-allowed opacity-60",
          buttonClassName,
        )}
        disabled={disabled}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted" />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-2xl animate-scale-in",
            menuClassName,
          )}
        >
          {options.map((option) => (
            <button
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-primary-soft/70",
                option.value === value && "bg-primary-soft font-bold text-primary-dark",
              )}
              key={option.value || "__empty"}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              <span className="truncate">{option.label}</span>
              {option.value === value ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
