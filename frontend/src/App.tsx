import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PendingApproval } from './pages/PendingApproval';
import { Unauthorized } from './pages/Unauthorized';

// Placeholder components for dashboards
const Home = () => <div>Home Page</div>;
const BuyerDashboard = () => <div>Buyer Dashboard</div>;
const VendorDashboard = () => <div>Vendor Dashboard</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/pending-approval" element={<PendingApproval />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Protected routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } />

                    {/* Buyer routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={['buyer']}>
                            <BuyerDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Vendor routes */}
                    <Route path="/vendor/*" element={
                        <ProtectedRoute allowedRoles={['vendor']}>
                            <Routes>
                                <Route path="dashboard" element={<VendorDashboard />} />
                            </Routes>
                        </ProtectedRoute>
                    } />

                    {/* Admin routes */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <Routes>
                                <Route path="dashboard" element={<AdminDashboard />} />
                            </Routes>
                        </ProtectedRoute>
                    } />
                </Routes>
                <Toaster />
            </AuthProvider>
        </Router>
    );
}

export default App;