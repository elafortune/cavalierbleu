import type { Metadata, Viewport } from "next";
import { Cinzel, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "700"] });

export const viewport: Viewport = {
  themeColor: "#081627",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cavalierbleu.com"),
  title: {
    default: "Institut Le Cavalier Bleu — Cours d'échecs avec un Grand-Maître International",
    template: "%s · Institut Le Cavalier Bleu",
  },
  description:
    "Cours d'échecs en ligne, coaching, stages et séminaires avec le GMI Darko Anic, Maître-Entraîneur FFE. École d'échecs à distance depuis 1995.",
  icons: { icon: "/images/logo1.gif" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Institut Le Cavalier Bleu",
    images: ["/images/darko.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
