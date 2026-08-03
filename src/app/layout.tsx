import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'نظرمن | دنبال هر چیزی می‌گردید؟',
  description:
    'نظرمن — نظر واقعی مردم دربارهٔ هر چیزی؛ جا، آدم، محصول، وب‌سایت و… بخوانید و ثبت کنید.',
};

export const viewport: Viewport = {
  themeColor: '#f6f9f8',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}