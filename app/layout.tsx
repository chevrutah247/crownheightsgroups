import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crown Heights Groups - Community Directory",
  description: "Find and join WhatsApp groups, services, and resources in Crown Heights and beyond",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Crown Heights Groups',
    description: 'Community directory for Crown Heights',
    url: 'https://crownheightsgroups.com',
    siteName: 'Crown Heights Groups',
    type: 'website',
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
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
