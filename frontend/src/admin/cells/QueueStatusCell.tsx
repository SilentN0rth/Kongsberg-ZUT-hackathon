import { Chip } from "@heroui/react";
import type { DefaultServerCellComponentProps } from "payload";

const MAP = {
  PENDING: { label: "Oczekuje", color: "warning" },
  PROCESSED: { label: "Przetworzone", color: "success" },
  FAILED: { label: "Błąd", color: "danger" },
} as const;

export function QueueStatusCell({ cellData }: DefaultServerCellComponentProps) {
  const s = cellData as keyof typeof MAP | undefined;
  if (!s) return <span>—</span>;
  return (
    <Chip color={MAP[s].color} variant={s === "FAILED" ? "primary" : "soft"}>
      <Chip.Label>{MAP[s].label}</Chip.Label>
    </Chip>
  );
}
