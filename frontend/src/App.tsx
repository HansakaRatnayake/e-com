import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';

// Layout components
import { MainLayout } from './layouts/MainLayout';
import { VendorLayout } from './layouts/VendorLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PendingApproval } from './pages/PendingApproval';
import { Unauthorized } from './pages/Unauthorized';

// Product Pages
import { ProductList } from './pages/products/ProductList';
import { ProductDetail } from './pages/products/ProductDetail';

// Cart & Checkout Pages
import { CartPage } from './pages/cart/CartPage';
import { Checkout } from './pages/checkout/Checkout';

// Order Pages
import { OrderList } from './pages/orders/OrderList';
import { OrderDetail } from './pages/orders/OrderDetail';

// Vendor Pages
import { VendorDashboard } from './pages/vendor/VendorDashboard';
import { VendorProducts } from './pages/vendor/VendorProducts';
import { CreateProduct } from './pages/products/CreateProduct.tsx';
import { EditProduct } from './pages/products/EditProduct.tsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Placeholder components
const Home = () => (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to E-commerce Platform</h1>
        <p className="text-gray-600">Start shopping for amazing products!</p>
    </div>
);

const BuyerDashboard = () => (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
    </div>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/pending-approval" element={<PendingApproval />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Main Layout Routes */}
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<Home />} />
                            <Route path="products" element={<ProductList />} />
                            <Route path="products/:slug" element={<ProductDetail />} />

                            {/* Protected buyer routes */}
                            <Route path="cart" element={
                                <ProtectedRoute>
                                    <CartPage />
                                </ProtectedRoute>
                            } />
                            <Route path="checkout" element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            } />
                            <Route path="orders" element={
                                <ProtectedRoute>
                                    <OrderList />
                                </ProtectedRoute>
                            } />
                            <Route path="orders/:id" element={
                                <ProtectedRoute>
                                    <OrderDetail />
                                </ProtectedRoute>
                            } />
                            <Route path="dashboard" element={
                                <ProtectedRoute allowedRoles={['buyer']}>
                                    <BuyerDashboard />
                                </ProtectedRoute>
                            } />
                        </Route>

                        {/* Vendor Layout Routes */}
                        <Route path="/vendor" element={
                            <ProtectedRoute allowedRoles={['vendor']}>
                                <VendorLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<VendorDashboard />} />
                            <Route path="dashboard" element={<VendorDashboard />} />
                            <Route path="products" element={<VendorProducts />} />
                            <Route path="products/new" element={<CreateProduct />} />
                            <Route path="products/:id/edit" element={<EditProduct />} />
                            <Route path="orders" element={<OrderList />} />
                            <Route path="orders/:id" element={<OrderDetail />} />
                        </Route>

                        {/* Admin Layout Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<AdminDashboard />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="orders" element={<OrderList />} />
                            <Route path="orders/:id" element={<OrderDetail />} />
                        </Route>
                    </Routes>
                    <Toaster />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;