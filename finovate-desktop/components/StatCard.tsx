'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  description?: string;
}

export function StatCard({ title, value, icon: Icon, trend, description }: StatCardProps) {
  const formattedValue =
    typeof value === 'number'
      ? formatCurrency(value)
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200 border-gray-200 rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          {Icon && <Icon className="h-4 w-4 text-gray-400" />}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{formattedValue}</div>
          {trend && (
            <p
              className={`text-xs mt-2 font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

