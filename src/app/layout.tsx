import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NFL Mock Draft Simulator",
  description:
    "AI-powered four-round NFL mock draft simulator built for a Full Stack AI Engineer assignment.",
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
