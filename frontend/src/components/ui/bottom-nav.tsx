import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { buttonVariants } from "@heroui/styles";
import { ClockIcon, HomeIcon, InboxIcon, QrScanIcon, UserIcon } from "@/components/ui/icons";

type Item = { key: string; label: string; href?: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

const LEFT: Item[] = [
  { key: "home", label: "Główna", href: "/urzadzenia", Icon: HomeIcon },
  { key: "watch", label: "Wachta", Icon: ClockIcon },
];
const RIGHT: Item[] = [
  { key: "service", label: "Serwis", Icon: InboxIcon },
  { key: "profile", label: "Profil", Icon: UserIcon },
];

const BAR = 72; // px, height of the bar without the safe area

function NavItem({ item, active }: { item: Item; active: boolean }) {
  const base = "flex h-16 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-medium tracking-[0.005em]";
  const { Icon } = item;
  if (!item.href) {
    // Not built yet: shown for layout, not clickable.
    return (
      <span aria-disabled="true" className={`${base} text-white/40`}>
        <Icon width={26} height={26} />
        {item.label}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`wb-press ${base} transition-colors hover:bg-white/10 ${active ? "text-cyan" : "text-white/80 hover:text-white"}`}
    >
      <Icon width={26} height={26} />
      {item.label}
    </Link>
  );
}

// Glass dock: the blur follows a notch that holds the scan button (see .wb-dock-glass).
export function BottomNav({ active }: { active: "home" }) {
  return (
    <nav aria-label="Główna nawigacja" className="absolute inset-x-0 bottom-0 z-20 lg:hidden">
      <div
        aria-hidden="true"
        className="wb-dock-glass absolute inset-x-0 bottom-0"
        style={{ height: `calc(${BAR}px + env(safe-area-inset-bottom, 0px))` }}
      />

      {/* bright top edge: light catching the glass, drawn in the same three pieces as the mask */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 flex" style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + 0px)`, height: BAR, marginBottom: 0 }}>
        <div className="flex-1 rounded-tl-[30px] border-t border-white/30" />
        <svg width="140" height={BAR} viewBox={`0 0 140 ${BAR}`} fill="none" className="shrink-0">
          <path d="M0 .5C22 .5 26 40.5 70 40.5C114 40.5 118 .5 140 .5" stroke="rgb(255 255 255 / 0.3)" />
        </svg>
        <div className="flex-1 rounded-tr-[30px] border-t border-white/30" />
      </div>

      <Link
        href="/skanuj"
        aria-label="Skanuj kod przy urządzeniu"
        className={`${buttonVariants({ variant: "primary", size: "lg", isIconOnly: true })} wb-lift absolute left-1/2 z-10 size-16 -translate-x-1/2 rounded-full [&_svg]:size-8 shadow-[0_8px_22px_rgb(0_214_230/0.35)]`}
        style={{ bottom: `calc(${BAR}px + env(safe-area-inset-bottom, 0px) - 32px)` }}
      >
        <QrScanIcon width={30} height={30} />
      </Link>

      <div
        className="relative flex items-start px-3 pt-1"
        style={{ height: `calc(${BAR}px + env(safe-area-inset-bottom, 0px))`, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {LEFT.map((i) => (
          <NavItem key={i.key} item={i} active={i.key === active} />
        ))}
        <span aria-hidden="true" className="w-20 shrink-0" />
        {RIGHT.map((i) => (
          <NavItem key={i.key} item={i} active={i.key === active} />
        ))}
      </div>
    </nav>
  );
}
