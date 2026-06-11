import type { Metadata } from "next";
import { Schibsted_Grotesk, Newsreader, Geist_Mono } from "next/font/google";
import { COPY, SITE_URL } from "@/lib/brand";
import "./globals.css";

const display = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Done Friday — one working tool for your practice, every Friday",
  description:
    "A weekly newsletter for owners of small professional-services firms. One problem in your practice, one working tool, every Friday. We don't write about AI. We build with it.",
  openGraph: {
    title: "Done Friday",
    description: COPY.sub,
    url: SITE_URL,
    siteName: "Done Friday",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Done Friday",
    description: COPY.sub,
  },
  alternates: { canonical: SITE_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Done Friday",
  url: SITE_URL,
  description: COPY.sub,
  publisher: {
    "@type": "Person",
    name: "Tom Wild",
    url: "https://hellocrossman.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
