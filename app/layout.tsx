import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Space Shooter - Epic Shoot'em Up",
  description: "An engaging vertical shoot'em up game with stunning visuals and smooth gameplay",
  manifest: "/manifest.json",
  themeColor: "#0a0a0f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Space Shooter",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
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
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
