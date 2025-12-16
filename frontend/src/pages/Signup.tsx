import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, UserIcon, DocumentDuplicateIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useLoading } from '../context/LoadingContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GoogleButton } from '../components/ui/GoogleButton';

import { authService } from '../services/auth';
import { useUser } from '../context/UserContext';
import GradientText from '../components/ui/GradientText';
import BentoCardWrapper from '../components/ui/BentoCardWrapper';
import '../components/ui/BentoCardWrapper.css';
import { useEffect, useState, useCallback } from 'react';

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: any) => void;
                    prompt: (callback?: (notification: any) => void) => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Signup() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isLoading, showLoading, hideLoading } = useLoading();
    const { refreshUser } = useUser();
    const [googleLoading, setGoogleLoading] = useState(false);
    const [password, setPassword] = useState('');

    // Password strength calculation
    const getPasswordStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[a-z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return score;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];

    const handleGoogleResponse = useCallback(async (response: any) => {
        if (response.credential) {
            setGoogleLoading(true);
            showLoading('Signing up with Google...');
            try {
                await authService.googleLogin(response.credential);
                await refreshUser();
                showToast('success', 'Account created with Google!');
                navigate('/dashboard');
            } catch (error: any) {
                console.error('Google signup error:', error);
                showToast('error', error.response?.data?.detail || 'Failed to sign up with Google');
            } finally {
                hideLoading();
                setGoogleLoading(false);
            }
        }
    }, [navigate, refreshUser, showLoading, hideLoading, showToast]);

    useEffect(() => {
        // Load Google Identity Services script
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (window.google && GOOGLE_CLIENT_ID) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleResponse,
                });
            }
        };

        return () => {
            document.body.removeChild(script);
        };
    }, [handleGoogleResponse]);

    const handleGoogleClick = () => {
        if (window.google && GOOGLE_CLIENT_ID) {
            window.google.accounts.id.prompt();
        } else if (!GOOGLE_CLIENT_ID) {
            showToast('error', 'Google login is not configured. Please add GOOGLE_CLIENT_ID to your .env file.');
        } else {
            showToast('error', 'Google Sign-In is not yet loaded. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        showLoading('Creating account...');

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await authService.signup({ name, email, password });
            // Auto login after signup
            await authService.login({ email, password });
            await refreshUser(); // Fetch user details
            showToast('success', 'Account created successfully!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Signup error:', error);
            showToast('error', error.response?.data?.detail || 'Failed to create account. Please try again.');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300 p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen dark:bg-indigo-500/5" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen dark:bg-primary-500/5" />
            </div>

            {/* Main Card */}
            <div className="w-full max-w-5xl bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 dark:border-dark-border relative z-10 animate-fade-in max-h-[90vh]">

                {/* Left Side - Product Showcase */}
                <BentoCardWrapper
                    glowColor="139, 92, 246"
                    enableTilt={false}
                    enableParticles={true}
                    className="hidden lg:flex lg:w-[45%] bg-gray-900 relative p-8 flex-col justify-between overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-gray-900 to-primary-900/40 opacity-90 z-10" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay" />

                    {/* Floating UI Elements (Showcase) */}
                    <div className="relative z-20 flex-1 flex items-center justify-center">
                        <div className="relative w-full max-w-xs scale-90">
                            {/* Project Summary Card */}
                            <motion.div
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
                                animate={{ y: [0, -8, 0], rotate: [2, 0, 2] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                        <DocumentDuplicateIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Q1 Financials</h4>
                                        <p className="text-gray-400 text-xs">3 documents processed</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-gray-300">
                                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                        <span>Identity Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-300">
                                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                        <span>Signatures Valid</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-300">
                                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                                        <span>No Alterations</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-gray-800 flex items-center justify-center text-[8px] text-white">
                                                {i}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs text-indigo-300 font-medium">View Report -&gt;</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="relative z-20 mt-8">
                        <h2 className="text-xl font-bold text-white mb-2">Start for free</h2>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Create an account today and get 14 days of premium access to all our advanced analysis tools.
                        </p>
                    </div>
                </BentoCardWrapper>

                {/* Right Side - Signup Form */}
                <div className="w-full lg:w-[55%] p-6 sm:p-8 lg:p-10 bg-white dark:bg-dark-card flex flex-col justify-center overflow-y-auto">
                    <div className="max-w-md mx-auto w-full space-y-6">
                        <div className="text-center lg:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"><GradientText animationSpeed={5}>Create an account</GradientText></h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Start your 14-day free trial today
                            </p>
                        </div>

                        <div className="space-y-3">
                            <GoogleButton onClick={handleGoogleClick} isLoading={googleLoading} />

                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative bg-white dark:bg-dark-card px-4 text-xs text-gray-500 dark:text-gray-400">
                                    or sign up with email
                                </div>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <Input
                                label="Full Name"
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                                icon={<UserIcon className="h-5 w-5" />}
                                className="py-2.5"
                            />

                            <Input
                                label="Email address"
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="you@example.com"
                                icon={<EnvelopeIcon className="h-5 w-5" />}
                                className="py-2.5"
                            />

                            <div className="space-y-2">
                                <Input
                                    label="Password"
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    icon={<LockClosedIcon className="h-5 w-5" />}
                                    className="py-2.5"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {/* Password Strength Indicator */}
                                {password && (
                                    <div className="space-y-1.5">
                                        <div className="flex gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all ${i < passwordStrength
                                                            ? strengthColors[passwordStrength - 1]
                                                            : 'bg-gray-200 dark:bg-slate-700'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className={`font-medium ${passwordStrength <= 1 ? 'text-red-500' :
                                                    passwordStrength <= 2 ? 'text-orange-500' :
                                                        passwordStrength <= 3 ? 'text-yellow-600' :
                                                            passwordStrength <= 4 ? 'text-lime-600' : 'text-green-600'
                                                }`}>
                                                {strengthLabels[passwordStrength - 1] || 'Too short'}
                                            </span>
                                            <span className="text-gray-400 dark:text-gray-500">
                                                Min: 8 chars, uppercase, lowercase, number
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline">
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="#" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline">
                                    Privacy Policy
                                </a>
                                .
                            </div>

                            <Button
                                type="submit"
                                variant="gradient"
                                size="lg"
                                className="w-full text-base py-3 font-semibold shadow-xl shadow-primary-500/20"
                                isLoading={isLoading}
                            >
                                Create Account
                            </Button>
                        </form>

                        <div className="pt-2 text-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-all">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
