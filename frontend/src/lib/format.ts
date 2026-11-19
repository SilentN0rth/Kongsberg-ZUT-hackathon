export const hm = (iso: string) => new Date(iso).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

export const hms = (d: Date) => d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function ago(iso: string, now: number) {
  const min = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (min < 1) return "przed chwilą";
  if (min < 60) return `${min} min temu`;
  const h = Math.floor(min / 60);
  return h < 24 ? `${h} h temu` : `${Math.floor(h / 24)} d temu`;
}
