'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleThemeToggle } from '@/components/ui/simple-theme-toggle';

const pageInfo = {
  '/dashboard': {
    title: 'Dashboard',
    description: 'Overview of your finances and recent activity'
  },
  '/transactions': {
    title: 'Transactions',
    description: 'Manage your income and expenses'
  },
  '/invoices': {
    title: 'Invoices',
    description: 'Add and manage your invoices'
  },
  '/settings': {
    title: 'Settings',
    description: 'Manage your account settings and preferences'
  },
  '/auth': {
    title: 'Authentication',
    description: 'Sign in to your account'
  }
};

export function Header() {
  const pathname = usePathname();
  const currentPage = pageInfo[pathname as keyof typeof pageInfo];

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 z-30 bg-gradient-to-r from-white to-gray-50 dark:from-[#0a0a0a] dark:to-[#0a0a0a] shadow-[0_1px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_4px_rgba(255,255,255,0.05)] transition-colors duration-300 lg:rounded-tl-xl">
      <div className="flex items-center justify-between h-24 px-8 sm:px-10 lg:px-12">
        {/* Left side - Mobile Menu + Page Title */}
        <div className="flex items-center gap-6">
          {/* Mobile menu spacer */}
          <div className="lg:hidden w-12"></div>
          
          <div className="flex flex-col">
            {currentPage && (
              <>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
                  {currentPage.title}
                </h1>
                <p className="text-base text-gray-500 dark:text-gray-400 leading-tight mt-1 hidden sm:block">
                  {currentPage.description}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Right side - Action Icons */}
        <div className="flex items-center gap-5">
          {/* Notification Bell */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 h-10 w-10"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Theme Toggle */}
          <SimpleThemeToggle />

          {/* User Avatar */}
          <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-base cursor-pointer hover:bg-indigo-700 transition-colors duration-200">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
