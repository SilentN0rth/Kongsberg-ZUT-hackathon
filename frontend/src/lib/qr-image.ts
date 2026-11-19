import jsQR from "jsqr";

// Odczyt kodu QR ze zdjęcia (np. zrobionego aparatem systemowym przez <input type="file" capture>).
// Nie wymaga HTTPS ani dostępu do kamery z poziomu strony, więc działa też na http://<ip>:3000 w sieci lokalnej.
// Duże zdjęcia z telefonu są zmniejszane; próbujemy dwóch rozmiarów, bo mały kod bywa lepiej widoczny na mniejszym obrazie.
const MAX_SIDES = [1600, 900];

export async function decodeQrFromFile(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    for (const maxSide of MAX_SIDES) {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const w = Math.max(1, Math.round(img.naturalWidth * scale));
      const h = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0, w, h);
      const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "attemptBoth" });
      if (code?.data) return code.data;
    }
    return null;
  } catch {
    return null; // nieobsługiwany format zdjęcia albo uszkodzony plik
  } finally {
    URL.revokeObjectURL(url);
  }
}
