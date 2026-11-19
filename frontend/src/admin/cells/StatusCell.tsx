import { Chip } from "@heroui/react";
import type { DefaultServerCellComponentProps } from "payload";
import { STATUS_LABEL, type ReportStatus } from "@/lib/catalog";

const COLOR = { NEW: "accent", ACKNOWLEDGED: "default", RESOLVED: "success" } as const;

export function StatusCell({ cellData }: DefaultServerCellComponentProps) {
  const s = cellData as ReportStatus | undefined;
  if (!s) return <span>—</span>;
  return (
    <Chip color={COLOR[s]} variant="soft">
      <Chip.Label>{STATUS_LABEL[s]}</Chip.Label>
    </Chip>
  );
}
