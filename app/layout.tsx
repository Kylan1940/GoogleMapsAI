import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sora, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Google Maps AI",
  description: "Google Maps AI adalah aplikasi web yang memanfaatkan kecerdasan buatan untuk membantu pengguna menemukan tempat dengan lebih mudah dan cepat. Dengan menggunakan bahasa natural, pengguna dapat mencari tempat yang sesuai dengan kebutuhan mereka.",
  keywords: [
    "Google Maps AI",
    "aplikasi web",
    "kecerdasan buatan",
    "bahasa natural",
    "pencarian tempat",
    "lokasi",
    "ulasan",
    "rating",
    "jarak",
    "harga",
  ],
  authors: [{ name: "Kylan1940", url: "github.com/Kylan1940" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WFFYCKYK3P"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            window.gtag = gtag;

            gtag('js', new Date());
            gtag('config', 'G-WFFYCKYK3P');
          `}
        </Script>
      </body>
    </html>
  );
}