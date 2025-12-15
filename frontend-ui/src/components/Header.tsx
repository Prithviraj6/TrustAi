import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import GooeyNav from './ui/GooeyNav';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 20);
    });

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How it Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#pricing' },
    ];

    // GooeyNav formatted items
    const gooeyNavItems = navLinks.map(link => ({
        label: link.name,
        href: link.href
    }));

    return (
        <>
            <motion.header
                initial={{ y: -100, x: "-50%" }}
                animate={{ y: 0, x: "-50%" }}
                transition={{ duration: 0.5 }}
                className={`fixed top-4 left-1/2 w-[95%] max-w-7xl z-50 rounded-full transition-all duration-300 ${isScrolled
                    ? 'bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg shadow-black/5'
                    : 'bg-white/50 dark:bg-black/50 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-sm'
                    }`}
            >
                <div className="px-6">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300 text-center leading-none">
                                T
                                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                TrustAI
                            </span>
                        </Link>

                        {/* Desktop Nav with GooeyNav */}
                        <nav className="hidden md:flex items-center text-gray-600 dark:text-gray-300">
                            <GooeyNav
                                items={gooeyNavItems}
                                animationTime={600}
                                particleCount={12}
                                particleDistances={[70, 10]}
                                particleR={80}
                                colors={[1, 2, 3, 4]}
                                initialActiveIndex={-1}
                            />
                        </nav>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? (
                                    <SunIcon className="w-5 h-5" />
                                ) : (
                                    <MoonIcon className="w-5 h-5" />
                                )}
                            </button>
                            <div className="h-6 w-px bg-gray-200 dark:bg-white/10" />
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/signup"
                                className="px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-105 active:scale-95"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-4 md:hidden">
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                {theme === 'dark' ? (
                                    <SunIcon className="w-5 h-5" />
                                ) : (
                                    <MoonIcon className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                {mobileMenuOpen ? (
                                    <XMarkIcon className="w-6 h-6" />
                                ) : (
                                    <Bars3Icon className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl z-40 md:hidden overflow-hidden shadow-2xl shadow-black/20"
                    >
                        <div className="px-6 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="block text-lg font-medium text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    className="block w-full text-center py-3 text-gray-600 dark:text-gray-300 font-medium hover:text-gray-900 dark:hover:text-white"
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block w-full text-center py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
