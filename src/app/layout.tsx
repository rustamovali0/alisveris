import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alisveris.az"),
  title: {
    default: "alışveriş.az - Al, sat və axtardığını tap",
    template: "%s | alışveriş.az",
  },
  description:
    "Azərbaycan üçün müasir elan və alış-veriş platforması. Yeni və ikinci əl məhsulları tap, satıcı ilə əlaqə saxla və elanını dərc et.",
  openGraph: {
    title: "alışveriş.az",
    description: "Premium, təhlükəsiz və sürətli marketplace təcrübəsi.",
    siteName: "alışveriş.az",
    locale: "az_AZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "alışveriş.az",
    description: "Al, sat və axtardığını asanlıqla tap.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="az"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
