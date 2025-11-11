import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ThemeScript } from '@/components/theme-script';
import { AuthWrapper } from '@/components/AuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dwinsoft — Smart Account & Invoice Manager',
  description: 'Manage your finances, transactions, and invoices with ease',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeScript />
        <AuthWrapper>
          <div className="flex min-h-screen bg-[#f9fafb] dark:bg-neutral-950">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-0 min-w-0 bg-[#f9fafb] dark:bg-neutral-950">
              <Header />
              <main className="flex-1 pt-28 pb-10 px-8 sm:px-10 lg:px-12 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
          </div>
        </AuthWrapper>
        <Toaster />
      </body>
    </html>
  );
}
