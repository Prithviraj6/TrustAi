import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    icon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors duration-300">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
                        block w-full rounded-xl border-2 border-gray-100 dark:border-slate-700 
                        bg-gray-50 dark:bg-slate-800/50 text-slate-900 dark:text-white 
                        shadow-sm transition-all duration-300 ease-out
                        focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none sm:text-sm
                        disabled:bg-slate-50 disabled:text-slate-500
                        placeholder-slate-400 dark:placeholder-slate-500
                        py-3.5
                        ${icon ? 'pl-11' : 'pl-4'}
                        ${error ? 'border-red-300 focus:border-red-500' : 'hover:border-gray-300 dark:hover:border-slate-600'}
                        ${className}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 animate-fade-in flex items-center gap-1 ml-1">
                    <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
