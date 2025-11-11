'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Settings,
  Menu,
  X,
  Wallet,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/bank-accounts', label: 'Bank Accounts', icon: Building2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          className="bg-white/90 backdrop-blur-sm border-neutral-200 shadow-md"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && !isDesktop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#f3f4f6] dark:bg-neutral-900 border-r border-gray-200 dark:border-neutral-700 z-40 lg:z-auto',
          'flex flex-col shadow-sm',
          'lg:translate-x-0',
          !isDesktop && !isOpen && '-translate-x-full',
          'transition-transform duration-300'
        )}
      >
        <div className="p-6 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">Dwinsoft</h2>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-white hover:shadow-sm',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-neutral-300 hover:text-gray-900 dark:hover:bg-neutral-800 dark:hover:text-white'
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-white" : "text-neutral-500 dark:text-neutral-400"
                )} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
