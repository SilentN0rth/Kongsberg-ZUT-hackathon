import { z } from "zod";
import { PRIORITIES, SYMPTOMS } from "@/lib/catalog";

// Walidacja formularza zgłoszenia (kształt zgodny z ReportIn z backendu).
export const reportSchema = z.object({
  deviceId: z.string().min(1, "Wybierz urządzenie"),
  symptom: z.enum(SYMPTOMS, { message: "Wybierz objaw" }),
  priority: z.enum(PRIORITIES.map((p) => p.id) as ["LOW", "MEDIUM", "CRITICAL"], { message: "Wybierz priorytet" }),
  note: z.string().trim().max(280, "Notatka może mieć najwyżej 280 znaków").optional(),
});

export function validateReport(input: unknown) {
  const result = reportSchema.safeParse(input);
  if (result.success) return { ok: true as const, data: result.data };
  return { ok: false as const, errors: z.flattenError(result.error).fieldErrors };
}

// Treść kodu QR: pełny link (…/zglos?urzadzenie=pompa-03), ścieżka albo sam identyfikator urządzenia.
export function deviceIdFromCode(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  try {
    const url = new URL(text, "http://local.invalid");
    const fromParam = url.searchParams.get("urzadzenie");
    if (fromParam) return fromParam;
  } catch {
    /* nie jest linkiem */
  }
  return /^[a-z0-9-]{2,40}$/i.test(text) ? text.toLowerCase() : null;
}
