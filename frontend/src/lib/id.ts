// Identyfikator zgłoszenia generowany w przeglądarce (klucz idempotencji kolejki).
// crypto.randomUUID() istnieje tylko w bezpiecznym kontekście (HTTPS lub localhost), a skanery i telefony
// łączą się z komputerem mostka po http://<ip>:3000. Wtedy używamy crypto.getRandomValues(), który działa zawsze.
export function newId(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === "function") return c.randomUUID();
  const b = new Uint8Array(16);
  if (c?.getRandomValues) c.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40; // wersja 4
  b[8] = (b[8] & 0x3f) | 0x80; // wariant RFC 4122
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0"));
  return `${h.slice(0, 4).join("")}-${h.slice(4, 6).join("")}-${h.slice(6, 8).join("")}-${h.slice(8, 10).join("")}-${h.slice(10).join("")}`;
}
