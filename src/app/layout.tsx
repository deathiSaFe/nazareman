import type { Metadata, Viewport } from 'next';
import { Lalezar, Vazirmatn } from 'next/font/google'; // ← ADD
import './globals.css';

// ← ADD: display face (wordmark/headings/FAB) + body face
const vazirmatn = Vazirmatn({ subsets: ['arabic'], variable: '--font-sans', display: 'swap' });
const lalezar = Lalezar({ subsets: ['arabic'], weight: '400', variable: '--font-display', display: 'swap' });

// ← REPLACE metadata
export const metadata: Metadata = {
  title: 'نظرمن | دنبال هر چیزی می‌گردید؟',
  description: 'نظرمن — نظر واقعی مردم دربارهٔ هر چیزی؛ جا، آدم، محصول، وب‌سایت و… بخوانید و ثبت کنید.',
};

// ← ADD
export const viewport: Viewport = {
  themeColor: '#f6f9f8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // ← MODIFY: lang, dir, font variables
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${lalezar.variable}`}>
      <body>{children}</body>
    </html>
  );
}