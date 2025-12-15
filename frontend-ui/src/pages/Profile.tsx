import { useRef, useState } from 'react';
import {
    CameraIcon,
    ArrowRightOnRectangleIcon,
    TrashIcon,
    MoonIcon,
    SunIcon,
    UserIcon,
    EnvelopeIcon,
    ShieldCheckIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useLoading } from '../context/LoadingContext';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function Profile() {
    const { user, updateUser, logout } = useUser();
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();
    const { theme, toggleTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Local state for UI-only fields
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                updateUser({ profileImage: base64String });
                showToast('success', 'Profile photo updated');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        showLoading('Saving changes...');
        setTimeout(() => {
            updateUser({ firstName, lastName });
            hideLoading();
            showToast('success', 'Profile updated');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-dark-bg animate-fade-in pb-20">
            {/* Hero Banner */}
            <div className="h-48 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-900 dark:to-purple-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50/50 dark:from-dark-bg to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
                        <p className="text-purple-100">Manage your personal information</p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column - Identity Card */}
                    <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border overflow-hidden">
                            <div className="p-6 flex flex-col items-center text-center">
                                <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full bg-white dark:bg-dark-card p-1 shadow-lg">
                                        <div className="w-full h-full rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 text-4xl font-bold overflow-hidden relative">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                `${user.firstName[0]}${user.lastName[0]}`
                                            )}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <CameraIcon className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    accept="image/*"
                                />

                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {user.firstName} {user.lastName}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{user.email}</p>

                                <div className="flex gap-2 mb-6">
                                    <Badge variant="success" className="px-3 py-1">
                                        <SparklesIcon className="w-3 h-3 mr-1" />
                                        Premium Plan
                                    </Badge>
                                </div>

                                <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-dark-border pt-6">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">128</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Chats</span>
                                    </div>
                                    <div className="text-center border-l border-gray-100 dark:border-dark-border">
                                        <span className="block text-2xl font-bold text-gray-900 dark:text-white">85%</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trust Score</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border p-6 flex-1 flex flex-col h-full">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 px-1">Account & Support</h3>
                            <div className="space-y-3 flex-1">
                                <button
                                    className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800/50 hover:bg-white hover:shadow-md dark:hover:bg-slate-800 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                            <SparklesIcon className="w-5 h-5" />
                                        </div>
                                        <span>Help & Support</span>
                                    </div>
                                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-400 -rotate-90" />
                                </button>

                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800/50 hover:bg-white hover:shadow-md dark:hover:bg-slate-800 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-400 group-hover:scale-110 transition-transform">
                                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        </div>
                                        <span>Sign Out</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete your account?')) {
                                            showToast('info', 'Action not implemented in demo');
                                        }
                                    }}
                                    className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 hover:bg-white hover:shadow-md dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/30 rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                            <TrashIcon className="w-5 h-5" />
                                        </div>
                                        <span>Delete Account</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Settings */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-600 dark:text-primary-400">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h3>
                                    <p className="text-gray-500 dark:text-gray-400">Update your personal details here.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-gray-900 dark:text-white font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 transition-all outline-none text-gray-900 dark:text-white font-medium"
                                    />
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={user.email}
                                            disabled
                                            className="w-full px-4 py-3 pl-11 rounded-xl bg-gray-100 dark:bg-slate-800 border-2 border-transparent text-gray-500 cursor-not-allowed font-medium"
                                        />
                                        <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button
                                    onClick={handleSave}
                                    disabled={firstName === user.firstName && lastName === user.lastName}
                                    className="px-8 py-3 text-base shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </div>

                        {/* Preferences */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    <SparklesIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preferences</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Customize your app experience.</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                            {theme === 'dark' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <span className="block text-sm font-semibold text-gray-900 dark:text-white">Dark Mode</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Adjust the appearance of the app</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your password and security settings.</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                                <div>
                                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">Password</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Last changed 3 months ago</span>
                                </div>
                                <Button variant="secondary" size="sm">Change Password</Button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
