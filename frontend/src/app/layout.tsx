import type { Metadata } from "next";
import { Inter, Saira_Condensed, Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { PricingProvider } from "@/providers/PricingProvider";
import { CartProvider } from "@/providers/CartProvider";
import { FloatingCart } from "@/components/layout/FloatingCart";
import { siteConfig } from "@/config/site";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const saira = Saira_Condensed({
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: siteConfig.brandName,
  description: `${siteConfig.brandName} — Catálogo de Equipamentos`,
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${saira.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative">
        <ThemeProvider defaultTheme={siteConfig.theme} defaultLayout={siteConfig.layout}>
          <PricingProvider>
            <CartProvider>
              {children}
              <FloatingCart />
            </CartProvider>
          </PricingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
