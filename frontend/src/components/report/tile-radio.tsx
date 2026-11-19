import type { CSSProperties, ReactNode } from "react";
import { CheckIcon } from "@/components/ui/icons";

type TileRadioProps = {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  children: ReactNode;
  /** CSS color for the selected border and check mark. */
  tone?: string;
  className?: string;
};

// A native radio hidden behind a large tile: keyboard, screen readers and gloves all work.
export function TileRadio({ name, value, checked, onSelect, children, tone = "var(--color-aqua)", className = "" }: TileRadioProps) {
  return (
    <label className="group/tile relative block cursor-pointer" style={{ "--tone": tone } as CSSProperties}>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onSelect(value)} className="peer sr-only" />
      <span
        className={`wb-press wb-card flex min-h-20 items-center gap-3 rounded-2xl border-2 border-transparent p-3 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-sea group-has-checked/tile:border-(--tone) group-has-checked/tile:bg-white ${className}`}
      >
        {children}
      </span>
      <CheckIcon
        width={22}
        height={22}
        className="pointer-events-none absolute top-2 right-2 hidden text-(--tone) group-has-checked/tile:block"
      />
    </label>
  );
}
