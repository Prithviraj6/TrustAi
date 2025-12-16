import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    CpuChipIcon,
    FolderIcon,
    UserIcon,
    Cog6ToothIcon,
    XMarkIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';
import { useEffect, useRef } from 'react';
import Dock from './ui/Dock';
import type { DockItemData } from './ui/Dock';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, logout } = useUser();
    const sidebarRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'AI Tools', href: '/dashboard/ai', icon: CpuChipIcon },
        { name: 'Projects', href: '/dashboard/projects', icon: FolderIcon },
        { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
        { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
    ];

    // Check if route is active
    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    // Dock items with active state
    const dockItems: DockItemData[] = [
        ...navigation.map(item => ({
            icon: <item.icon className="w-6 h-6" />,
            label: item.name,
            onClick: () => navigate(item.href),
            className: isActive(item.href) ? 'dock-item-active' : ''
        })),
        {
            icon: <ArrowRightOnRectangleIcon className="w-6 h-6 text-red-400" />,
            label: 'Sign Out',
            onClick: logout,
            className: 'dock-item-logout'
        }
    ];

    // Close on outside click (mobile)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (window.innerWidth < 1024) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Mobile Sidebar (when open) */}
            {isOpen && (
                <div
                    ref={sidebarRef}
                    className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col shadow-xl lg:hidden"
                >
                    {/* Mobile Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-dark-border">
                        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                T
                            </div>
                            <span>TrustAI</span>
                        </div>
                        <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Mobile Full Nav */}
                    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.href === '/dashboard'}
                                onClick={() => window.innerWidth < 1024 && onClose()}
                                className={({ isActive }) => `
                                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
                                    ${isActive
                                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className="w-6 h-6 mr-3" />
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Mobile Profile Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold flex-shrink-0">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span>{user.firstName[0]}{user.lastName[0]}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Free Plan</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Sign out"
                            >
                                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop: Floating Dock Only */}
            <div className="hidden lg:flex fixed left-3 top-1/2 -translate-y-1/2 z-[9999] overflow-visible">
                <div className="relative overflow-visible">
                    <Dock
                        items={dockItems}
                        magnification={52}
                        baseItemSize={38}
                        distance={100}
                    />
                </div>
            </div>
        </>
    );
}
