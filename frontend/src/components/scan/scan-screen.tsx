"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Chip, ProgressCircle, ToggleButton } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { CameraOffIcon, ChevronLeftIcon, GridIcon, QrScanIcon, TorchIcon } from "@/components/ui/icons";
import { Screen } from "@/components/ui/screen";
import { useDevices } from "@/lib/hooks";
import { deviceIdFromCode } from "@/lib/schemas";

const SCAN_EVERY_MS = 120;

// Prawdziwy skaner: obraz z kamery jest dekodowany (jsQR), a rozpoznany kod urządzenia otwiera formularz zgłoszenia.
export function ScanScreen() {
  const router = useRouter();
  const { devices } = useDevices();
  const [hint, setHint] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [torchOk, setTorchOk] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const devicesRef = useRef(devices);
  const handled = useRef(false);

  useEffect(() => {
    devicesRef.current = devices;
  });

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let lastScan = 0;
    let lastBad = "";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    function onCode(raw: string) {
      if (handled.current) return;
      const id = deviceIdFromCode(raw);
      const known = devicesRef.current;
      if (!id || (known && !known.some((d) => d.id === id))) {
        if (raw !== lastBad) {
          lastBad = raw;
          setHint(id ? `Nieznane urządzenie: ${id}` : "To nie jest kod urządzenia");
        }
        return;
      }
      handled.current = true;
      navigator.vibrate?.(40);
      const name = known?.find((d) => d.id === id)?.name ?? id;
      setHint(`Odczytano: ${name}`);
      router.push(`/zglos?urzadzenie=${encodeURIComponent(id)}`);
    }

    function tick(time: number) {
      raf = requestAnimationFrame(tick);
      const video = videoRef.current;
      if (!ctx || !video || video.readyState < 2 || !video.videoWidth || time - lastScan < SCAN_EVERY_MS) return;
      lastScan = time;
      const w = 480;
      const h = Math.round((video.videoHeight / video.videoWidth) * w);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      const code = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
      if (code?.data) onCode(code.data);
    }

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamError("Aparat wymaga połączenia HTTPS lub adresu localhost. Wybierz urządzenie ręcznie.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        const caps = stream.getVideoTracks()[0]?.getCapabilities?.() as (MediaTrackCapabilities & { torch?: boolean }) | undefined;
        setTorchOk(Boolean(caps?.torch));
        raf = requestAnimationFrame(tick);
      } catch {
        if (!cancelled) setCamError("Brak dostępu do aparatu. Zezwól na niego w ustawieniach albo wybierz urządzenie ręcznie.");
      }
    }
    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [router]);

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch {
      setTorchOk(false);
    }
  }

  return (
    <Screen tone="dark">
      <video ref={videoRef} playsInline muted autoPlay className="absolute inset-0 size-full object-cover" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgb(3_42_57/0.55)_0%,transparent_28%,transparent_55%,rgb(14_18_20/0.85)_100%)]"
      />

      <header
        className="relative z-10 flex items-center justify-between px-5"
        style={{ paddingTop: "max(1.25rem, env(safe-area-inset-top))" }}
      >
        <Link
          href="/urzadzenia"
          aria-label="Wróć do listy urządzeń"
          className={`${buttonVariants({ variant: "tertiary", isIconOnly: true })} wb-glass-dark wb-press size-12 rounded-full [&_svg]:size-7`}
        >
          <ChevronLeftIcon width={28} height={28} />
        </Link>
        {torchOk && (
          <ToggleButton
            isIconOnly
            isSelected={torchOn}
            onChange={() => void toggleTorch()}
            aria-label="Latarka"
            className="wb-glass-dark size-12 rounded-full [&_svg]:size-6 data-[selected=true]:bg-aqua data-[selected=true]:text-ink"
          >
            <TorchIcon width={26} height={26} />
          </ToggleButton>
        )}
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-6">
        {camError ? (
          <div role="alert" className="wb-glass-dark flex max-w-sm flex-col items-center gap-4 rounded-3xl p-6 text-center">
            <CameraOffIcon width={44} height={44} className="text-aqua" />
            <p className="type-body">{camError}</p>
            <Link
              href="/zglos"
              className={`${buttonVariants({ variant: "primary", size: "lg" })} wb-lift h-12 rounded-full px-8 font-semibold`}
            >
              Wybierz urządzenie ręcznie
            </Link>
          </div>
        ) : (
          <>
            <div className="relative aspect-square w-[min(76%,320px)] rounded-[2rem] bg-white/10 lg:w-[min(46vh,440px)]">
              <span className="absolute top-0 left-0 size-14 rounded-tl-[2rem] border-t-[3px] border-l-[3px] border-white" />
              <span className="absolute top-0 right-0 size-14 rounded-tr-[2rem] border-t-[3px] border-r-[3px] border-white" />
              <span className="absolute bottom-0 left-0 size-14 rounded-bl-[2rem] border-b-[3px] border-l-[3px] border-white" />
              <span className="absolute right-0 bottom-0 size-14 rounded-br-[2rem] border-r-[3px] border-b-[3px] border-white" />
              <div className="absolute inset-y-0 -inset-x-7 overflow-hidden">
                <div className="wb-sweep h-full w-full border-b-2 border-white" />
              </div>
            </div>
            <div role="status">
              <Chip size="lg" variant="soft" className="wb-glass-dark h-auto max-w-full px-5 py-3">
                <Chip.Label className="type-body whitespace-normal text-center text-white">
                  {hint ?? "Skieruj aparat na kod przy urządzeniu"}
                </Chip.Label>
              </Chip>
            </div>
          </>
        )}
      </main>

      <footer
        className="relative z-10 grid grid-cols-3 items-center px-8 pt-4"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        <Link
          href="/zglos"
          aria-label="Wybierz urządzenie ręcznie"
          className={`${buttonVariants({ variant: "secondary", isIconOnly: true })} wb-press size-16 justify-self-start rounded-2xl bg-white text-deep [&_svg]:size-8`}
        >
          <GridIcon width={30} height={30} />
        </Link>
        {camError ? (
          <span aria-hidden="true" />
        ) : (
          <span aria-hidden="true" className="grid size-20 place-items-center justify-self-center rounded-full bg-aqua/20 text-aqua">
            <ProgressCircle isIndeterminate aria-label="Skanowanie" size="lg">
              <ProgressCircle.Track>
                <ProgressCircle.TrackCircle />
                <ProgressCircle.FillCircle />
              </ProgressCircle.Track>
            </ProgressCircle>
            <QrScanIcon width={26} height={26} className="absolute" />
          </span>
        )}
        <span aria-hidden="true" />
      </footer>
    </Screen>
  );
}
