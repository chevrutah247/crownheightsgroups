import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://crownheightsgroups.com'),
  title: {
    default: "Crown Heights Groups - WhatsApp Community Directory",
    template: "%s | Crown Heights Groups"
  },
  description: "Find and join WhatsApp groups in Crown Heights, Brooklyn. Community groups, business, jobs, services, Torah learning, buy & sell, and more.",
  keywords: ["Crown Heights", "WhatsApp groups", "Brooklyn", "Jewish community", "Chabad", "770", "community directory", "local services"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://crownheightsgroups.com",
    siteName: "Crown Heights Groups",
    title: "Crown Heights Groups - WhatsApp Community Directory",
    description: "Find and join WhatsApp groups in Crown Heights, Brooklyn.",
  },
  robots: {
    index: true,
    follow: true,
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
        <meta name="theme-color" content="#1e3a5f" />
      </head>
      <body>{children}</body>
    </html>
  );
}
