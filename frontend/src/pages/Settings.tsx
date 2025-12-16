import { useState, useEffect, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
    BellIcon,
    SwatchIcon,
    CircleStackIcon,
    LockClosedIcon,
    AdjustmentsHorizontalIcon,
    GlobeAltIcon,
    ExclamationTriangleIcon,
    CommandLineIcon,
    ChatBubbleLeftRightIcon,
    FolderIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    ChevronDownIcon,
    HomeIcon,
    CalendarIcon,
    ClockIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
    return (
        <button
            className={`${enabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border border-transparent dark:border-slate-500`}
            onClick={() => onChange(!enabled)}
        >
            <span
                className={`${enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </button>
    );
}

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { showToast } = useToast();

    const [settings, setSettings] = useState({
        darkMode: theme === 'dark',
        fontSize: 'Medium',
        chatDensity: 'Comfortable',
        desktopNotifs: true,
        emailAlerts: false,
        trustScoreAlert: true,
        newProjectAlert: false,
        soundEffects: true,
        analytics: true,
        errorReporting: true,
        hideSensitive: false,
        autoAnonymize: false,
        defaultPage: 'Dashboard',
        autoSave: true,
        autoScroll: true,
        showTimestamps: false,
        trustVisualizer: true,
        language: 'English (US)',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24-hour',
    });

    useEffect(() => {
        setSettings(prev => ({ ...prev, darkMode: theme === 'dark' }));
    }, [theme]);

    const updateSetting = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        if (key === 'darkMode') {
            setTheme(value ? 'dark' : 'light');
        }
        showToast('success', `${key} updated to ${value}`);
    };



    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-dark-bg animate-fade-in pb-20">
            {/* Hero Banner */}
            <div className="h-48 bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-900 dark:to-purple-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50/50 dark:from-dark-bg to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                        <p className="text-purple-100">Manage your application preferences</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 space-y-8">

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <SwatchIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Appearance</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize how TrustAI looks.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Easy on the eyes</p>
                            </div>
                            <Toggle enabled={settings.darkMode} onChange={(v) => updateSetting('darkMode', v)} />
                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Font Size</label>
                                <div className="flex bg-gray-100 dark:bg-slate-800 rounded-xl p-1.5">
                                    {['Small', 'Medium', 'Large'].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => updateSetting('fontSize', size)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${settings.fontSize === size
                                                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Chat Density</label>
                                <Menu as="div" className="relative block w-full">
                                    <Menu.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-slate-800 py-2.5 pl-4 pr-10 text-left border border-gray-200 dark:border-slate-700 focus:outline-none focus-visible:border-primary-500 sm:text-sm">
                                        <span className="block truncate text-gray-900 dark:text-white font-medium">{settings.chatDensity}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Menu.Items className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-dark-card py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 border border-gray-100 dark:border-dark-border">
                                            {['Comfortable', 'Compact', 'Minimal'].map((density) => (
                                                <Menu.Item key={density}>
                                                    {({ active }) => (
                                                        <button
                                                            className={`relative cursor-default select-none py-2 pl-4 pr-4 w-full text-left ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                                                }`}
                                                            onClick={() => updateSetting('chatDensity', density)}
                                                        >
                                                            <span className={`block truncate ${settings.chatDensity === density ? 'font-medium text-primary-600 dark:text-primary-400' : 'font-normal'
                                                                }`}>
                                                                {density}
                                                            </span>
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-400">
                            <BellIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your alert preferences.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { key: 'desktopNotifs', label: 'Desktop Notifications', desc: 'Push notifications for important updates' },
                            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Daily summary and critical alerts' },
                            { key: 'trustScoreAlert', label: 'Low Trust Score Alerts', desc: 'Notify when score drops below 40' },
                            { key: 'newProjectAlert', label: 'New Project Created', desc: 'Confirm project creation' },
                            { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sound on new message' },
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                                </div>
                                <Toggle enabled={settings[item.key as keyof typeof settings] as boolean} onChange={(v) => updateSetting(item.key, v)} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Data & Privacy */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <CircleStackIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Data & Storage</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your data.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Button
                                variant="secondary"
                                className="w-full justify-start text-sm py-3 px-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border-none flex items-center gap-3"
                                onClick={() => {
                                    if (confirm('Clear chat history?')) showToast('info', 'Chat history cleared');
                                }}
                            >
                                <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                Clear Chat History
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full justify-start text-sm py-3 px-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border-none flex items-center gap-3"
                                onClick={() => {
                                    if (confirm('Clear project history?')) showToast('info', 'Project history cleared');
                                }}
                            >
                                <FolderIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                Clear Project History
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full justify-start text-sm py-3 px-4 bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border-none flex items-center gap-3"
                                onClick={() => {
                                    if (confirm('Clear search history?')) showToast('info', 'Search history cleared');
                                }}
                            >
                                <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                Clear Search History
                            </Button>
                            <Button
                                variant="secondary"
                                className="w-full justify-start text-sm py-3 px-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border-none flex items-center gap-3"
                                onClick={() => {
                                    if (confirm('Delete temp files?')) showToast('success', 'Temporary files deleted');
                                }}
                            >
                                <TrashIcon className="w-5 h-5" />
                                Delete Temporary Files
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                                <LockClosedIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Privacy</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Privacy controls.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { key: 'analytics', label: 'Usage Analytics', desc: 'Help us improve TrustAI' },
                                { key: 'errorReporting', label: 'Error Reporting', desc: 'Automatically report bugs' },
                                { key: 'hideSensitive', label: 'Hide Sensitive Info', desc: 'Blur PII in previews' },
                                { key: 'autoAnonymize', label: 'Auto-Anonymize', desc: 'Remove names from data' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between py-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                                    </div>
                                    <Toggle enabled={settings[item.key as keyof typeof settings] as boolean} onChange={(v) => updateSetting(item.key, v)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* App Preferences */}
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300">
                            <AdjustmentsHorizontalIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">App Preferences</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">General application settings.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Default Page</label>
                            <Menu as="div" className="relative block w-full">
                                <Menu.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-slate-800 py-3 pl-10 pr-10 text-left border border-gray-200 dark:border-slate-700 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <HomeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                    </span>
                                    <span className="block truncate text-gray-900 dark:text-white font-medium">{settings.defaultPage}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Menu.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Menu.Items className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-dark-card py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 border border-gray-100 dark:border-dark-border">
                                        {['Dashboard', 'AI Tools', 'Projects'].map((page) => (
                                            <Menu.Item key={page}>
                                                {({ active }) => (
                                                    <button
                                                        className={`relative cursor-default select-none py-2 pl-10 pr-4 w-full text-left ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                                            }`}
                                                        onClick={() => updateSetting('defaultPage', page)}
                                                    >
                                                        <span className={`block truncate ${settings.defaultPage === page ? 'font-medium text-primary-600 dark:text-primary-400' : 'font-normal'
                                                            }`}>
                                                            {page}
                                                        </span>
                                                        {settings.defaultPage === page && (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </button>
                                                )}
                                            </Menu.Item>
                                        ))}
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: 'autoSave', label: 'Auto-save Chats' },
                                { key: 'autoScroll', label: 'Auto-scroll in Chat' },
                                { key: 'showTimestamps', label: 'Show Timestamps' },
                                { key: 'trustVisualizer', label: 'Show Trust Visualizer' },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                                    <Toggle enabled={settings[item.key as keyof typeof settings] as boolean} onChange={(v) => updateSetting(item.key, v)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Keyboard Shortcuts & Region */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-600 dark:text-gray-300">
                                <CommandLineIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Productivity boosters.</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: 'Enter', action: 'Send Message' },
                                { key: 'Shift + Enter', action: 'New Line' },
                                { key: 'Esc', action: 'Close Modal' },
                                { key: 'Ctrl + K', action: 'Quick Search' },
                                { key: 'Ctrl + /', action: 'Show Shortcuts' },
                            ].map((item) => (
                                <div key={item.key} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium">{item.action}</span>
                                    <kbd className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-700 dark:text-gray-300 font-mono text-xs border border-gray-200 dark:border-slate-700 shadow-sm">
                                        {item.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <GlobeAltIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Language & Region</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Localization settings.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Language</label>
                                <Menu as="div" className="relative block w-full">
                                    <Menu.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-slate-800 py-3 pl-10 pr-10 text-left border border-gray-200 dark:border-slate-700 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <GlobeAltIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                        </span>
                                        <span className="block truncate text-gray-900 dark:text-white font-medium">{settings.language}</span>
                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                            <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                        </span>
                                    </Menu.Button>
                                    <Transition
                                        as={Fragment}
                                        leave="transition ease-in duration-100"
                                        leaveFrom="opacity-100"
                                        leaveTo="opacity-0"
                                    >
                                        <Menu.Items className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-dark-card py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 border border-gray-100 dark:border-dark-border">
                                            {['English (US)', 'Spanish', 'French', 'German'].map((lang) => (
                                                <Menu.Item key={lang}>
                                                    {({ active }) => (
                                                        <button
                                                            className={`relative cursor-default select-none py-2 pl-10 pr-4 w-full text-left ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                                                }`}
                                                            onClick={() => updateSetting('language', lang)}
                                                        >
                                                            <span className={`block truncate ${settings.language === lang ? 'font-medium text-primary-600 dark:text-primary-400' : 'font-normal'
                                                                }`}>
                                                                {lang}
                                                            </span>
                                                            {settings.language === lang && (
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                </span>
                                                            )}
                                                        </button>
                                                    )}
                                                </Menu.Item>
                                            ))}
                                        </Menu.Items>
                                    </Transition>
                                </Menu>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Date Format</label>
                                    <Menu as="div" className="relative block w-full">
                                        <Menu.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-slate-800 py-3 pl-10 pr-10 text-left border border-gray-200 dark:border-slate-700 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                            </span>
                                            <span className="block truncate text-gray-900 dark:text-white font-medium">{settings.dateFormat}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Menu.Items className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-dark-card py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 border border-gray-100 dark:border-dark-border">
                                                {['DD/MM/YYYY', 'MM/DD/YYYY'].map((format) => (
                                                    <Menu.Item key={format}>
                                                        {({ active }) => (
                                                            <button
                                                                className={`relative cursor-default select-none py-2 pl-10 pr-4 w-full text-left ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                                                    }`}
                                                                onClick={() => updateSetting('dateFormat', format)}
                                                            >
                                                                <span className={`block truncate ${settings.dateFormat === format ? 'font-medium text-primary-600 dark:text-primary-400' : 'font-normal'
                                                                    }`}>
                                                                    {format}
                                                                </span>
                                                                {settings.dateFormat === format && (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Time Format</label>
                                    <Menu as="div" className="relative block w-full">
                                        <Menu.Button className="relative w-full cursor-pointer rounded-xl bg-gray-50 dark:bg-slate-800 py-3 pl-10 pr-10 text-left border border-gray-200 dark:border-slate-700 focus:outline-none focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-300 sm:text-sm">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <ClockIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                            </span>
                                            <span className="block truncate text-gray-900 dark:text-white font-medium">{settings.timeFormat}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Menu.Items className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-dark-card py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 border border-gray-100 dark:border-dark-border">
                                                {['12-hour', '24-hour'].map((format) => (
                                                    <Menu.Item key={format}>
                                                        {({ active }) => (
                                                            <button
                                                                className={`relative cursor-default select-none py-2 pl-10 pr-4 w-full text-left ${active ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'
                                                                    }`}
                                                                onClick={() => updateSetting('timeFormat', format)}
                                                            >
                                                                <span className={`block truncate ${settings.timeFormat === format ? 'font-medium text-primary-600 dark:text-primary-400' : 'font-normal'
                                                                    }`}>
                                                                    {format}
                                                                </span>
                                                                {settings.timeFormat === format && (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600 dark:text-primary-400">
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50/50 dark:bg-red-900/5 rounded-2xl shadow-lg border border-red-100 dark:border-red-900/30 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Danger Zone</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Irreversible actions.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button
                            variant="secondary"
                            className="bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 text-sm border-red-100 dark:border-red-900/30"
                            onClick={() => {
                                if (confirm('Reset all settings?')) showToast('success', 'All settings reset to default');
                            }}
                        >
                            Reset All Settings
                        </Button>
                        <Button
                            variant="secondary"
                            className="bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 text-sm border-red-100 dark:border-red-900/30"
                            onClick={() => {
                                if (confirm('Reset appearance?')) showToast('success', 'Appearance settings reset');
                            }}
                        >
                            Reset Appearance
                        </Button>

                        <Button
                            variant="secondary"
                            className="bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 text-sm border-red-100 dark:border-red-900/30"
                            onClick={() => {
                                if (confirm('Reset notifications?')) showToast('success', 'Notification settings reset');
                            }}
                        >
                            Reset Notifications
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
