import Link from "next/link";
import type { ServerProps } from "payload";
import { Logo } from "@/admin/Logo";
import { getSettings } from "@/lib/server/settings";

// Nagłówek panelu bocznego: znak, nazwa i nazwa statku z ustawień.
export async function NavBrand({ payload }: ServerProps) {
  const { vesselName } = await getSettings(payload);
  return (
    <Link href="/admin" className="wb-nav-brand" aria-label="Pulpit">
      <Logo />
      <span className="wb-nav-brand__vessel">{vesselName}</span>
    </Link>
  );
}
