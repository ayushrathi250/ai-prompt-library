import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
            {title}
          </p>
          <motion.h3
            key={value}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {value.toLocaleString()}
          </motion.h3>
          {subtitle && (
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px] font-medium mt-2">
              {subtitle}
            </div>
          )}
        </div>

        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};
