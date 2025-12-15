import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useLoading } from '../context/LoadingContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isLoading, showLoading, hideLoading } = useLoading();

    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!token) {
            showToast('error', 'Invalid or missing reset token.');
            navigate('/login');
        }
    }, [token, navigate, showToast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('error', 'Passwords do not match');
            return;
        }

        if (!token) return;

        showLoading('Resetting password...');

        try {
            await authService.resetPassword(token, password);
            showToast('success', 'Password reset successfully! Please login.');
            navigate('/login');
        } catch (error: any) {
            console.error('Reset password error:', error);
            showToast('error', error.response?.data?.detail || 'Failed to reset password.');
        } finally {
            hideLoading();
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300 p-4">
            <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-dark-border p-8 animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Enter your new password below.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="New Password"
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        icon={<LockClosedIcon className="h-5 w-5" />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Input
                        label="Confirm Password"
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="••••••••"
                        icon={<LockClosedIcon className="h-5 w-5" />}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <Button
                        type="submit"
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Reset Password
                    </Button>
                </form>

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
