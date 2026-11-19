// Logo na ekranie logowania i w nagłówku panelu: znak z kodem QR + nazwa.
export function Logo() {
  return (
    <span className="wb-admin-logo">
      <svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="#032a39" />
        <g fill="none" stroke="#3fbac2" strokeWidth="2.4" strokeLinecap="round">
          <path d="M9 14v-2a3 3 0 0 1 3-3h2M26 9h2a3 3 0 0 1 3 3v2M31 26v2a3 3 0 0 1-3 3h-2M14 31h-2a3 3 0 0 1-3-3v-2" />
        </g>
        <g fill="#f3f6f7">
          <rect x="14" y="14" width="5" height="5" rx="1" />
          <rect x="21" y="14" width="5" height="5" rx="1" />
          <rect x="14" y="21" width="5" height="5" rx="1" />
          <rect x="22" y="22" width="3" height="3" rx="0.6" />
        </g>
      </svg>
      <span className="wb-admin-logo__text">WatchBrief</span>
    </span>
  );
}
