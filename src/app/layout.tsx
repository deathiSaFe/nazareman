import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نظرمن | نظر مردم، قبل از تصمیم شما",
  description: "نظرمن؛ نظر مردم، قبل از تصمیم شما.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.className}>
      <body className="bg-white text-neutral-900 antialiased">{children}</body>
    </html>
  );
}