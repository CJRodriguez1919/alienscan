import Link from "next/link";

const NAV_ITEMS = [
  { href: "/map", label: "Map" },
  { href: "/stats", label: "Stats" },
  { href: "/scan", label: "Scan area" },
  { href: "/about", label: "About" },
];

export function Nav() {
  return (
    <header className="border-b border-paper-200 bg-paper-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-7 w-7 items-center justify-center rounded-full border border-signal-500 text-signal-600 transition-transform group-hover:rotate-12"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <ellipse cx="12" cy="14" rx="9" ry="3" />
              <ellipse cx="12" cy="11" rx="5" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold tracking-tightish text-ink-900">
            AlienScan
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 font-body text-sm text-ink-700 transition-colors hover:bg-paper-100 hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
