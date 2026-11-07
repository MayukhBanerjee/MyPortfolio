import Link from "next/link";

export default function NotFound() {
  return (
    <main className="on-black flex min-h-[100svh] flex-col justify-between px-[var(--gutter)] py-6">
      <span className="mono text-[var(--mute)]">[ 404 ]</span>
      <div>
        <h1 className="display text-[clamp(64px,14vw,240px)]">Off the pitch.</h1>
        <p className="body-copy mt-6 text-[var(--paper)]/75">
          This page doesn&apos;t exist. Possibly a hallucination.
        </p>
      </div>
      <Link href="/" className="mono hover:opacity-60">
        [ back to kick-off ]
      </Link>
    </main>
  );
}
