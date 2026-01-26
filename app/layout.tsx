import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://crownheightsgroups.com'),
  title: {
    default: "Crown Heights Groups - WhatsApp Community Directory",
    template: "%s | Crown Heights Groups"
  },
  description: "Find and join WhatsApp groups in Crown Heights, Brooklyn. Community groups, business, jobs, services, Torah learning, buy & sell, and more.",
  keywords: ["Crown Heights", "WhatsApp groups", "Brooklyn", "Jewish community", "Chabad", "770", "community directory", "local services"],
  authors: [{ name: "Crown Heights Groups" }],
  creator: "Crown Heights Groups",
  publisher: "Crown Heights Groups",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://crownheightsgroups.com",
    siteName: "Crown Heights Groups",
    title: "Crown Heights Groups - WhatsApp Community Directory",
    description: "Find and join WhatsApp groups in Crown Heights, Brooklyn. Community, business, jobs, services, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Crown Heights Groups"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Crown Heights Groups - WhatsApp Community Directory",
    description: "Find and join WhatsApp groups in Crown Heights, Brooklyn.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Добавите позже из Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#1e3a5f" />
      </head>
      <body>{children}</body>
    </html>
  );
}
