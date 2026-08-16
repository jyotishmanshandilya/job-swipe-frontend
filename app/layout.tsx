import type { Metadata } from "next";
import { Nunito, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import "./ds/tokens.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { Analytics } from "@vercel/analytics/next";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.roleowl.org"),
  title: "RoleOwl — the owl hunts while you sleep",
  description:
    "RoleOwl reads company hiring systems directly and emails you fresh tech roles matched to your profile every morning — before the big job boards have them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
