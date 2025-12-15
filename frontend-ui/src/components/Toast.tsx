import { useEffect, useState } from 'react';
import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { type Toast as ToastType } from '../context/ToastContext';

interface ToastProps {
    toast: ToastType;
    onRemove: (id: string) => void;
}

export default function Toast({ toast, onRemove }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (toast.duration && toast.duration > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true);
            }, toast.duration - 300); // Start exit animation slightly before removal
            return () => clearTimeout(timer);
        }
    }, [toast.duration]);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300);
    };

    const icons = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        error: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />,
        warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />,
        info: <InformationCircleIcon className="w-6 h-6 text-blue-500" />
    };

    const borderColors = {
        success: 'border-green-500',
        error: 'border-red-500',
        warning: 'border-yellow-500',
        info: 'border-blue-500'
    };

    return (
        <div
            className={`flex items-center w-full max-w-sm p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 border-l-4 ${borderColors[toast.type]} transition-all duration-300 ease-in-out transform ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
                } animate-slide-in-right`}
            role="alert"
        >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
                {icons[toast.type]}
            </div>
            <div className="ml-3 text-sm font-normal text-gray-900 dark:text-white">{toast.message}</div>
            <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:outline-none p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={handleRemove}
                aria-label="Close"
            >
                <span className="sr-only">Close</span>
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>
    );
}
