import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useLoading } from '../context/LoadingContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth';

export default function ForgotPassword() {
    const { showToast } = useToast();
    const { isLoading, showLoading, hideLoading } = useLoading();
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        showLoading('Sending reset link...');

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = formData.get('email') as string;

        try {
            await authService.forgotPassword(email);
            setEmailSent(true);
            showToast('success', 'Reset link sent if account exists!');
        } catch (error: any) {
            console.error('Forgot password error:', error);
            showToast('error', 'Failed to process request. Please try again.');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300 p-4">
            <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-dark-border p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password?</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {emailSent
                            ? "Check your email for the reset link."
                            : "Enter your email to receive a reset link."}
                    </p>
                </div>

                {!emailSent ? (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email address"
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            icon={<EnvelopeIcon className="h-5 w-5" />}
                        />

                        <Button
                            type="submit"
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Send Reset Link
                        </Button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm">
                            If an account exists with that email, we've sent password reset instructions.
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => setEmailSent(false)}
                        >
                            Try another email
                        </Button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
