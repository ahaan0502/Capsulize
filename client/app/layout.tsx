import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";

const rethinkSans = Rethink_Sans({
  weight: ['400', '500', '600', '700'],  // Add specific weights
  subsets: ["latin"],
  variable: "--font-rethink-sans",
});

export const metadata: Metadata = {
  title: "Capsulize",
  description: "OpenAI powered time capsules for personal growth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rethinkSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}