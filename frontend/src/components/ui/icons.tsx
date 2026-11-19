import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const MenuIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 8h16M4 16h10" />
  </Icon>
);

export const BellIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
    <path d="M10 21h4" />
  </Icon>
);

export const HomeIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
  </Icon>
);

export const ClockIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
);

export const InboxIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3.5 13H8l1 3h6l1-3h4.5" />
    <path d="M5.5 5h13L21 13v6H3v-6z" />
  </Icon>
);

export const UserIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Icon>
);

export const QrScanIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <rect x="8" y="8" width="3" height="3" rx="0.5" />
    <rect x="13" y="8" width="3" height="3" rx="0.5" />
    <rect x="8" y="13" width="3" height="3" rx="0.5" />
    <path d="M13 13h3v3" />
  </Icon>
);

export const ChevronLeftIcon = (p: P) => (
  <Icon {...p}>
    <path d="m14.5 5-7 7 7 7" />
  </Icon>
);

export const TorchIcon = (p: P) => (
  <Icon {...p}>
    <path d="M7 3h10l-2 6v2l-1 1v9h-4v-9l-1-1V9z" />
    <path d="M10 6h4" />
  </Icon>
);

export const GridIcon = (p: P) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Icon>
);

export const PlusIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const CheckIcon = (p: P) => (
  <Icon {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const CloseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const DropIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 3.5s6 6.2 6 10.5a6 6 0 0 1-12 0c0-4.3 6-10.5 6-10.5z" />
  </Icon>
);

export const VibrationIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 12h2.5l2-5 3 10 3-14 2.5 9H21" />
  </Icon>
);

export const SoundIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 10v4h3l5 4V6L7 10H4z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
    <path d="M18.5 6.5a8 8 0 0 1 0 11" />
  </Icon>
);

export const HeatIcon = (p: P) => (
  <Icon {...p}>
    <path d="M10 14.5V5a2 2 0 1 1 4 0v9.5a4 4 0 1 1-4 0z" />
    <path d="M12 9v7" />
  </Icon>
);

export const PowerIcon = (p: P) => (
  <Icon {...p}>
    <path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" />
    <path d="M3 3l18 18" />
  </Icon>
);

export const GaugeIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 17a8 8 0 1 1 16 0" />
    <path d="m12 17 4-5" />
    <path d="M7 17h10" />
  </Icon>
);

export const FlameIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.5 1 2 2 2 0-3-.5-5 1-8z" />
  </Icon>
);

export const AlertIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 4 3 19h18z" />
    <path d="M12 10v4M12 17h.01" />
  </Icon>
);

export const PinIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0C5.5 15.4 12 21 12 21z" />
    <circle cx="12" cy="10" r="2.5" />
  </Icon>
);

export const CameraOffIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M9 5h6l1.5 2H20a1 1 0 0 1 1 1v9M4 8a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h13" />
    <path d="M10 10a3.5 3.5 0 0 0 4 4" />
  </Icon>
);

export const CloudOffIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M9 5.5A6 6 0 0 1 17.7 9 4.5 4.5 0 0 1 19 17.5" />
    <path d="M6.5 18A4.5 4.5 0 0 1 5 9.4" />
    <path d="M7 18h8" />
  </Icon>
);

export const ArrowRightIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
);


