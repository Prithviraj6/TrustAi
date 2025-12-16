import { useLoading } from '../context/LoadingContext';

interface LoaderProps {
    type?: 'fullscreen' | 'spinner' | 'skeleton' | 'dots';
    className?: string;
}

export default function Loader({ type = 'spinner', className = '' }: LoaderProps) {
    if (type === 'fullscreen') {
        const { isLoading, loadingMessage } = useLoading();

        if (!isLoading) return null;

        return (
            <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl flex flex-col items-center space-y-4 max-w-sm w-full mx-4 animate-fade-in">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white animate-pulse">
                        {loadingMessage || 'Loading...'}
                    </p>
                </div>
            </div>
        );
    }

    if (type === 'spinner') {
        return (
            <div className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent h-4 w-4 ${className}`} role="status" aria-label="loading">
                <span className="sr-only">Loading...</span>
            </div>
        );
    }

    if (type === 'dots') {
        return (
            <div className={`flex space-x-1 ${className}`}>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            </div>
        );
    }

    if (type === 'skeleton') {
        return (
            <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}></div>
        );
    }

    return null;
}
