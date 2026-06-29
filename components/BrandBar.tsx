import Link from "next/link";
import type { Track } from "@/lib/types";
import AccountMenu from "./AccountMenu";
import BrandIcon from "./BrandIcon";

// Slim top bar shared by the secondary pages: brand link on the left, account
// menu on the right. Track-aware so the brand icon matches the page theme.
export default function BrandBar({ track = "app" }: { track?: Track }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-3">
      <Link href={track === "game" ? "/games" : "/"} className="flex items-center gap-2.5">
        <BrandIcon track={track} size="sm" />
        <span className="text-sm font-semibold tracking-tight text-ink">
          VibeCheck
        </span>
      </Link>
      <AccountMenu />
    </div>
  );
}
