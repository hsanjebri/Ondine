import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Manrope, Mrs_Saint_Delafield } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { site } from "@/lib/site";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { PageTransition } from "@/components/providers/PageTransition";
import { Header } from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { BagDrawer } from "@/components/layout/BagDrawer";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { Preloader } from "@/components/ui/Preloader";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-plex-mono",
  display: "swap",
});

/** Thin signature script — used once, for "Paris" in the hero. Not preloaded. */
const script = Mrs_Saint_Delafield({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script-face",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0b0a09",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable} ${plexMono.variable} ${script.variable}`}>
      <body>
        <a
          href="#main"
          className="micro fixed top-3 left-3 z-[300] -translate-y-20 bg-ink px-4 py-3 text-ivory focus:translate-y-0"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <PageTransition>
          <Header />
          <MobileMenu />
          <main id="main">{children}</main>
          <Footer />
          <BagDrawer />
        </PageTransition>
        <Cursor />
        <Preloader />
        <noscript>
          <style>{`.preloader{display:none!important}`}</style>
        </noscript>
      </body>
    </html>
  );
}
