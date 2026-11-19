import type { ReactNode, SVGProps } from "react";

// Large two-tone glyphs for the device cards: deep outline, one aqua accent.
function Glyph({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      stroke="#08435a"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

const A = "#3fbac2";

const KINDS: Record<string, ReactNode> = {
  pump: (
    <>
      <rect x="12" y="72" width="64" height="8" rx="3" />
      <circle cx="42" cy="50" r="20" />
      <circle cx="42" cy="50" r="7" fill={A} stroke="none" />
      <rect x="34" y="12" width="16" height="12" rx="2" />
      <path d="M42 24v6M62 50h14" />
      <rect x="74" y="40" width="10" height="20" rx="2" />
    </>
  ),
  compressor: (
    <>
      <rect x="10" y="40" width="58" height="28" rx="14" />
      <rect x="66" y="46" width="16" height="16" rx="3" />
      <circle cx="32" cy="24" r="9" />
      <path d="M32 33v7M32 24l4-4" stroke={A} />
      <path d="M24 68v10M54 68v10" />
    </>
  ),
  generator: (
    <>
      <rect x="10" y="28" width="76" height="44" rx="8" />
      <path d="M52 35 40 54h10l-4 15 14-21H48z" fill={A} stroke="none" />
      <path d="M22 72v8M74 72v8" />
      <circle cx="22" cy="40" r="2.5" fill="#08435a" stroke="none" />
    </>
  ),
  separator: (
    <>
      <path d="M30 14h36l-6 20H36z" />
      <rect x="26" y="34" width="44" height="40" rx="8" />
      <path d="M26 54h44" stroke={A} />
      <path d="M36 74v8M60 74v8" />
    </>
  ),
  cooler: (
    <>
      <rect x="22" y="12" width="52" height="72" rx="8" />
      <path d="M22 46h52" />
      <path d="M32 58v12" />
      <path d="M48 22v16M40 30h16M42 24l12 12M54 24 42 36" stroke={A} />
    </>
  ),
  rudder: (
    <>
      <circle cx="48" cy="44" r="22" />
      <circle cx="48" cy="44" r="5" fill={A} stroke="none" />
      <path d="M48 22v-8M48 66v8M26 44h-8M70 44h8M32 28l-6-6M64 60l6 6M64 28l6-6M32 60l-6 6" />
      <path d="M20 84h56" />
    </>
  ),
  anchor: (
    <>
      <circle cx="48" cy="20" r="7" />
      <path d="M48 27v50M34 40h28" />
      <path d="M18 56c4 18 18 22 30 22s26-4 30-22" stroke={A} />
      <path d="m18 56-6 6M78 56l6 6" />
    </>
  ),
  tank: (
    <>
      <rect x="24" y="14" width="48" height="60" rx="22" />
      <path d="M24 44h48" stroke={A} />
      <path d="M36 74v10M60 74v10M72 36h10M82 36v14" />
    </>
  ),
  fan: (
    <>
      <circle cx="48" cy="44" r="30" />
      <circle cx="48" cy="44" r="5" fill={A} stroke="none" />
      <path d="M48 39c-2-12 4-18 10-16-1 8-4 13-10 16zM53 44c12-2 18 4 16 10-8-1-13-4-16-10zM48 49c2 12-4 18-10 16 1-8 4-13 10-16zM43 44c-12 2-18-4-16-10 8 1 13 4 16 10z" />
      <path d="M36 84h24" />
    </>
  ),
};

function kindOf(id: string) {
  const prefix = id.split("-")[0];
  const map: Record<string, string> = {
    pompa: "pump",
    sprezarka: "compressor",
    agregat: "generator",
    separator: "separator",
    chlodnica: "cooler",
    ster: "rudder",
    winda: "anchor",
    hydrofor: "tank",
    wentylator: "fan",
  };
  return map[prefix] ?? "pump";
}

export function DeviceGlyph({ id, className }: { id: string; className?: string }) {
  return <Glyph className={className}>{KINDS[kindOf(id)]}</Glyph>;
}
