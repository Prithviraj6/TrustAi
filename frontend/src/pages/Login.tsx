import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ShieldCheckIcon, ChartBarIcon } from '@heroicons/react/24/outline';
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

export default function Login() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isLoading, showLoading, hideLoading } = useLoading();
    const { refreshUser } = useUser();
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleResponse = useCallback(async (response: any) => {
        if (response.credential) {
            setGoogleLoading(true);
            showLoading('Signing in with Google...');
            try {
                await authService.googleLogin(response.credential);
                await refreshUser();
                showToast('success', 'Successfully logged in with Google!');
                navigate('/dashboard');
            } catch (error: any) {
                console.error('Google login error:', error);
                showToast('error', error.response?.data?.detail || 'Failed to login with Google');
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
        showLoading('Authenticating...');

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = (formData.get('email') as string).trim();
        const password = (formData.get('password') as string).trim();

        try {
            await authService.login({ email, password });
            await refreshUser();
            showToast('success', 'Successfully logged in!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login error:', error);
            showToast('error', error.response?.data?.detail || 'Failed to login. Please check your credentials.');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg transition-colors duration-300 p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen dark:bg-primary-500/5" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen dark:bg-purple-500/5" />
            </div>

            {/* Main Card */}
            <div className="w-full max-w-5xl bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 dark:border-dark-border relative z-10 animate-fade-in max-h-[90vh]">

                {/* Left Side - Product Showcase */}
                <BentoCardWrapper
                    glowColor="59, 130, 246"
                    enableTilt={false}
                    enableParticles={true}
                    className="hidden lg:flex lg:w-[45%] bg-gray-900 relative p-8 flex-col justify-between overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900/40 opacity-90 z-10" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-10 mix-blend-overlay" />

                    {/* Floating UI Elements (Showcase) */}
                    <div className="relative z-20 flex-1 flex items-center justify-center">
                        <div className="relative w-full max-w-xs scale-90">
                            {/* Main Analysis Card */}
                            <motion.div
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl"
                                animate={{ y: [0, -8, 0], rotate: [-3, -1, -3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                                            <ShieldCheckIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Contract Analysis</h4>
                                            <p className="text-gray-400 text-xs">Verified 2m ago</p>
                                        </div>
                                    </div>
                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        98/100
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-2 bg-white/10 rounded-full w-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[98%]" />
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                        <span>Trust Score</span>
                                        <span className="text-green-400 font-medium">Excellent</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Secondary Stats Card */}
                            <motion.div
                                className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl w-48"
                                animate={{ y: [0, 6, 0], rotate: [3, 1, 3] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                                        <ChartBarIcon className="w-4 h-4" />
                                    </div>
                                    <span className="text-white font-bold text-xs">Risk Detected</span>
                                </div>
                                <div className="text-2xl font-bold text-white">0</div>
                                <p className="text-gray-400 text-[10px]">No anomalies found</p>
                            </motion.div>
                        </div>
                    </div>

                    <div className="relative z-20 mt-8">
                        <h2 className="text-xl font-bold text-white mb-2">Verify with confidence</h2>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Join thousands of professionals who trust our AI to analyze documents and detect risks in seconds.
                        </p>
                    </div>
                </BentoCardWrapper>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-[55%] p-6 sm:p-8 lg:p-10 bg-white dark:bg-dark-card flex flex-col justify-center overflow-y-auto">
                    <div className="max-w-md mx-auto w-full space-y-6">
                        <div className="text-center lg:text-left">
                            <div className="lg:hidden mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30 mb-6">
                                T
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight"><GradientText animationSpeed={5}>Welcome back</GradientText></h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Please enter your details to sign in
                            </p>
                        </div>

                        <div className="space-y-3">
                            <GoogleButton onClick={handleGoogleClick} isLoading={googleLoading} />

                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative bg-white dark:bg-dark-card px-4 text-xs text-gray-500 dark:text-gray-400">
                                    or continue with email
                                </div>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-4">
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

                                <div className="space-y-1">
                                    <Input
                                        label="Password"
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        icon={<LockClosedIcon className="h-5 w-5" />}
                                        className="py-2.5"
                                    />
                                    <div className="flex justify-end">
                                        <Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-colors duration-200">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="gradient"
                                size="lg"
                                className="w-full text-base py-3 font-semibold shadow-xl shadow-primary-500/20"
                                isLoading={isLoading}
                            >
                                Sign in
                            </Button>
                        </form>

                        <div className="pt-2 text-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                            <Link to="/signup" className="font-bold text-primary-600 hover:text-primary-500 dark:text-primary-400 hover:underline transition-all">
                                Sign up for free
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
