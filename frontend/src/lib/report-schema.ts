import { z } from "zod";
import { PRIORITIES, SYMPTOMS } from "@/lib/catalog";

// Kształt zgłoszenia przyjmowany przez kolejkę (ReportIn z dawnego backendu). Wspólny dla klienta i serwera.
export const reportInSchema = z.object({
  id: z.string().min(8, "Brak identyfikatora zgłoszenia").max(80),
  deviceId: z.string().min(1, "Wybierz urządzenie").max(60),
  symptom: z.enum(SYMPTOMS, { message: "Nieznany objaw" }),
  priority: z.enum(PRIORITIES.map((p) => p.id) as ["LOW", "MEDIUM", "CRITICAL"], { message: "Nieznany priorytet" }),
  note: z.string().trim().max(2000, "Notatka jest za długa").nullish(),
  createdAt: z.iso.datetime({ offset: true }).optional(),
});

export type ReportIn = z.infer<typeof reportInSchema>;
