import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlayMySong — Learn songs. Play your way.",
  description:
    "Learn guitar melodies one note at a time with clear, interactive tablature.",
  applicationName: "PlayMySong",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}