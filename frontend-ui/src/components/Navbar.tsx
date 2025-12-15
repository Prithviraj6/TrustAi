import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    BellIcon,
    UserCircleIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useUser();

    return (
        <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-7xl h-14 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 rounded-full flex items-center justify-between px-4 lg:px-6 z-30 shadow-lg shadow-black/5 transition-all duration-300">
            {/* Left Section - Logo & Brand */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-xl lg:hidden transition-colors"
                >
                    <Bars3Icon className="w-6 h-6" />
                </motion.button>

                {/* Logo & Brand Name */}
                <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow text-center leading-none">
                        T
                    </div>
                    <span className="hidden sm:block text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                        TrustAI
                    </span>
                </Link>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2">
                {/* Theme Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="p-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-xl transition-colors"
                    title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                    {theme === 'dark' ? (
                        <SunIcon className="w-5 h-5 text-amber-400" />
                    ) : (
                        <MoonIcon className="w-5 h-5 text-slate-600" />
                    )}
                </motion.button>

                {/* Notifications */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 rounded-xl transition-colors relative"
                    title="Notifications"
                >
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </motion.button>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block" />

                {/* User Menu */}
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
                        <div className="relative">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-xl object-cover ring-2 ring-white dark:ring-dark-card shadow-sm"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white dark:ring-dark-card shadow-sm">
                                    {user.firstName[0]}
                                </div>
                            )}
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-dark-card rounded-full" />
                        </div>
                        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
                            {user.firstName}
                        </span>
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95 translate-y-2"
                        enterTo="transform opacity-100 scale-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="transform opacity-100 scale-100 translate-y-0"
                        leaveTo="transform opacity-0 scale-95 translate-y-2"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border focus:outline-none overflow-hidden z-50">
                            {/* User Info Header */}
                            <div className="px-4 py-3 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-dark-border">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>

                            <div className="p-1.5">
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/dashboard/profile"
                                            className={`${active ? 'bg-gray-100 dark:bg-white/10' : ''} group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 transition-colors`}
                                        >
                                            <UserCircleIcon className="w-4 h-4 text-gray-400" />
                                            Your Profile
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/dashboard/settings"
                                            className={`${active ? 'bg-gray-100 dark:bg-white/10' : ''} group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 transition-colors`}
                                        >
                                            <Cog6ToothIcon className="w-4 h-4 text-gray-400" />
                                            Settings
                                        </Link>
                                    )}
                                </Menu.Item>
                            </div>

                            <div className="p-1.5 border-t border-gray-100 dark:border-dark-border">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={logout}
                                            className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''} group flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors`}
                                        >
                                            <ArrowRightOnRectangleIcon className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
}
