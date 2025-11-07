'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function PageShell({ title, description, children, actions }: PageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {actions && (
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
      
      <div className="space-y-5">
        {children}
      </div>
    </motion.div>
  );
}

