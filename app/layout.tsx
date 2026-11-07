import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Nav from "@/components/ui/Nav";
import MatchClock from "@/components/ui/MatchClock";
import { preload } from "react-dom";
import { images, site } from "@/data/portfolio";

const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo", display: "swap" });
const instrumentSans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument-sans", display: "swap" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

/** The address set as the homepage of the GitHub repo. Change it here if the live address differs. */
const url = "https://mayukh-banerjee.vercel.app";
const preview = { url: "/og.png", width: 1200, height: 630, alt: `${site.name}, ${site.role}` };

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title: `${site.name} · ${site.role}`,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${site.name} · ${site.role}`,
    description: site.description,
    url,
    siteName: site.name,
    type: "profile",
    images: [preview],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} · ${site.role}`,
    description: site.description,
    images: [preview.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: "AI/ML Engineer",
  address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressCountry: "IN" },
  alumniOf: "Vellore Institute of Technology",
  sameAs: [site.links.linkedin, site.links.github],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  preload(images.hero, { as: "image", fetchPriority: "high" });
  return (
    <html
      lang="en"
      data-phase="loading"
      data-intro="1"
      className={`${archivo.variable} ${instrumentSans.variable} ${instrumentSerif.variable} ${jetbrains.variable}`}
    >
      <body>
        <a
          href="#statement"
          className="mono sr-only z-[99] bg-[var(--paper)] px-3 py-2 text-[var(--black)] focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
        >
          Skip to content
        </a>
        <Providers>
          <Nav />
          {children}
          <MatchClock />
        </Providers>
        <div className="grain" aria-hidden="true" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
