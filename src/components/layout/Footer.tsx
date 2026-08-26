import { GitHubLogoIcon } from "@radix-ui/react-icons";

export function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-black/10 px-6 py-4 text-sm text-foreground/60">
      <span>© {new Date().getFullYear()} What Banjo Chord Is This?</span>
      <a
        href="https://github.com/JeuelyFish/what-banjo-chord-is-this"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
        className="text-foreground/60 transition-colors hover:text-foreground"
      >
        <GitHubLogoIcon width={20} height={20} aria-hidden="true" />
      </a>
    </footer>
  );
}
