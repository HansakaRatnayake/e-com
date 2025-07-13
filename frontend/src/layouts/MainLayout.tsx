import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartDrawer } from '../components/cart/CartDrawer';
import { Button } from '../components/ui/button';
import {
    User,
    LogOut,
    Package,
    LayoutDashboard,
    Menu,
    X,
    ShoppingBag
} from 'lucide-react';

export const MainLayout: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-8">
                            <Link to="/" className="text-xl font-bold text-primary">
                                E-Commerce
                            </Link>
                            <div className="hidden md:flex space-x-4">
                                <Link to="/products" className="text-gray-700 hover:text-primary">
                                    Products
                                </Link>
                                {isAuthenticated && (
                                    <Link to="/orders" className="text-gray-700 hover:text-primary">
                                        Orders
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-4">
                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'buyer' && (
                                        <Link to="/dashboard" className="text-gray-700 hover:text-primary">
                                            <User className="h-5 w-5" />
                                        </Link>
                                    )}
                                    {user?.role === 'vendor' && (
                                        <Link to="/vendor/dashboard" className="text-gray-700 hover:text-primary">
                                            <LayoutDashboard className="h-5 w-5" />
                                        </Link>
                                    )}
                                    {user?.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="text-gray-700 hover:text-primary">
                                            <LayoutDashboard className="h-5 w-5" />
                                        </Link>
                                    )}
                                    <Button variant="ghost" size="sm" onClick={handleLogout}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link to="/login">Login</Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link to="/register">Register</Link>
                                    </Button>
                                </>
                            )}
                            {isAuthenticated && <CartDrawer />}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center space-x-2">
                            {isAuthenticated && <CartDrawer />}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t">
                        <div className="px-4 py-2 space-y-2">
                            <Link
                                to="/products"
                                className="block py-2 text-gray-700 hover:text-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Products
                            </Link>
                            {isAuthenticated && (
                                <Link
                                    to="/orders"
                                    className="block py-2 text-gray-700 hover:text-primary"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Orders
                                </Link>
                            )}
                            {isAuthenticated ? (
                                <>
                                    {user?.role === 'buyer' && (
                                        <Link
                                            to="/dashboard"
                                            className="block py-2 text-gray-700 hover:text-primary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    {user?.role === 'vendor' && (
                                        <Link
                                            to="/vendor/dashboard"
                                            className="block py-2 text-gray-700 hover:text-primary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Vendor Dashboard
                                        </Link>
                                    )}
                                    {user?.role === 'admin' && (
                                        <Link
                                            to="/admin/dashboard"
                                            className="block py-2 text-gray-700 hover:text-primary"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Admin Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left py-2 text-gray-700 hover:text-primary"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block py-2 text-gray-700 hover:text-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block py-2 text-gray-700 hover:text-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main content */}
            <main className="min-h-[calc(100vh-4rem)]">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">E-Commerce</h3>
                            <p className="text-gray-400">Your trusted marketplace for quality products.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link to="/products" className="hover:text-white">Products</Link></li>
                                <li><Link to="/orders" className="hover:text-white">Orders</Link></li>
                                <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Categories</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="#" className="hover:text-white">Electronics</a></li>
                                <li><a href="#" className="hover:text-white">Clothing</a></li>
                                <li><a href="#" className="hover:text-white">Home & Garden</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>support@ecommerce.com</li>
                                <li>1-800-SHOP-NOW</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                        <p>&copy; 2025 E-commerce Platform. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
