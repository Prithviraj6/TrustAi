import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    glass?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    glass = false,
    onClick,
    ...props
}) => {
    return (
        <div
            onClick={onClick}
            className={`
                rounded-2xl border transition-all duration-300 relative
                ${glass
                    ? 'bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/20 dark:border-white/10 shadow-lg'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm'
                }
                ${hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-primary-200 dark:hover:border-primary-900/50' : ''}
                ${className}
            `}
            {...props}
        >
            {hover && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            )}
            {children}
        </div>
    );
};
