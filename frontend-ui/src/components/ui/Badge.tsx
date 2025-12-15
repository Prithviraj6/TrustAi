import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' | 'premium';
    size?: 'sm' | 'md';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'neutral',
    size = 'md',
    className = ''
}) => {
    const variants = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-transparent',
        warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:border-transparent',
        error: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/15 dark:text-rose-400 dark:border-transparent',
        info: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:border-transparent',
        neutral: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700/50 dark:text-slate-400 dark:border-transparent',
        default: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-transparent',
        premium: 'bg-gradient-to-r from-primary-500/10 to-purple-500/10 text-primary-700 border-primary-100 dark:text-primary-300 dark:border-transparent'
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm'
    };

    return (
        <span className={`
            inline-flex items-center font-medium rounded-full border
            ${variants[variant]}
            ${sizes[size]}
            ${className}
        `}
        >
            {children}
        </span>
    );
};

