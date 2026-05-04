export function Footer() {
  return (
    <footer className="border-t border-paper-200 bg-paper-50 py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 font-mono text-xs text-ink-500">
        <span>
          AlienScan · data from{" "}
          <a
            href="https://nuforc.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink-900"
          >
            NUFORC
          </a>{" "}
          via cleaned public datasets
        </span>
        <span>
          <a
            href="https://github.com/CJRodriguez1919/alienscan"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink-900"
          >
            github
          </a>
          {" · "}
          built with claude
        </span>
      </div>
    </footer>
  );
}
