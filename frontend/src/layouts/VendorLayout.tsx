import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import {
    Package,
    LayoutDashboard,
    LogOut,
    ShoppingBag,
    BarChart,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';

export const VendorLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/vendor/dashboard', icon: LayoutDashboard },
        { name: 'Products', href: '/vendor/products', icon: Package },
        { name: 'Orders', href: '/vendor/orders', icon: ShoppingBag },
        { name: 'Analytics', href: '/vendor/analytics', icon: BarChart },
        { name: 'Settings', href: '/vendor/settings', icon: Settings },
    ];

    const isActive = (href: string) => {
        return location.pathname === href || location.pathname.startsWith(href + '/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar */}
            <div className={cn(
                "fixed inset-0 z-50 lg:hidden",
                sidebarOpen ? "block" : "hidden"
            )}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
                    <div className="flex items-center justify-between h-16 px-4 border-b">
                        <span className="text-xl font-semibold">Vendor Portal</span>
                        <button onClick={() => setSidebarOpen(false)}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                    isActive(item.href)
                                        ? "bg-primary text-white"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-1 bg-white border-r">
                    <div className="flex items-center h-16 px-4 border-b">
                        <Link to="/" className="text-xl font-semibold">
                            Vendor Portal
                        </Link>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                    isActive(item.href)
                                        ? "bg-primary text-white"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                    <div className="p-4 border-t">
                        <div className="flex items-center mb-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium">{user?.profile.firstName} {user?.profile.lastName}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full" onClick={logout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                <div className="flex items-center justify-between h-16 px-4 bg-white border-b lg:hidden">
                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="text-xl font-semibold">Vendor Portal</span>
                    <div className="w-6" />
                </div>
                <main className="p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};