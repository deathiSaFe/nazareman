import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import SiteHeader from '@/components/layout/SiteHeader';

const vazirmatn = Vazirmatn({ subsets: ['arabic'] });

export const metadata: Metadata = {
  title: 'نظر من - هر نظر، کمک به یک انتخاب بهتر',
  description: 'پلتفرم اشتراک‌گذاری تجربیات واقعی، نظرات و توصیه‌ها',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={vazirmatn.className}>
        <SiteHeader />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}