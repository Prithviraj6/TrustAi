import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    // Check if current route is Project Details (e.g., /dashboard/projects/123)
    // But NOT /dashboard/projects (the list)
    const isProjectDetails = /^\/dashboard\/projects\/\d+/.test(location.pathname);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
            {/* Aesthetic Background */}
            <div className="fixed inset-0 pointer-events-none">
                {/* Gradient Mesh */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-purple-50/50 dark:from-primary-900/10 dark:via-transparent dark:to-purple-900/10" />

                {/* Animated Blobs */}
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200/30 dark:bg-primary-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-cyan-200/20 dark:bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />

                {/* Subtle Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
            </div>

            <div className="flex h-screen overflow-hidden relative z-10">
                {/* Sidebar (Floating Dock for desktop, slide-out for mobile) */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    <Navbar
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    <main className={`flex-1 ${isProjectDetails ? 'overflow-hidden p-0 pt-20' : 'overflow-y-auto p-4 lg:p-8 pt-20 lg:pt-24'} scroll-smooth`}>
                        <div className={`${isProjectDetails ? 'h-full' : 'max-w-7xl mx-auto w-full'} animate-fade-in`}>
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

