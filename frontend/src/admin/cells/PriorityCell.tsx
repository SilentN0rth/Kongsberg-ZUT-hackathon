import { Chip } from "@heroui/react";
import type { DefaultServerCellComponentProps } from "payload";
import { PRIORITY_LABEL, type Priority } from "@/lib/catalog";

const COLOR = { CRITICAL: "danger", MEDIUM: "warning", LOW: "default" } as const;

export function PriorityCell({ cellData }: DefaultServerCellComponentProps) {
  const p = cellData as Priority | undefined;
  if (!p) return <span>—</span>;
  return (
    <Chip color={COLOR[p]} variant={p === "CRITICAL" ? "primary" : "soft"}>
      <Chip.Label>{PRIORITY_LABEL[p]}</Chip.Label>
    </Chip>
  );
}
