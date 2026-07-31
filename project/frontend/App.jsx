// filepath: project/frontend/App.jsx
// Application principale - Configuration des routes

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import Users from './pages/Users';
import Subscriptions from './pages/Subscriptions';
import RequestSubscription from './pages/RequestSubscription';
import SubscriptionRequests from './pages/SubscriptionRequests';
import SubscriptionHistory from './pages/SubscriptionHistory';
import Profile from './pages/Profile';
import ProtectedRoute from './routes/ProtectedRoute';
import ProtectedAdminRoute from './routes/ProtectedAdminRoute';
import { getDefaultAuthenticatedPath, isAuthenticated, getCurrentUser } from './services/api';

// Composant pour protéger les routes
const RoleRoute = ({ allowedRoles, children }) => {
    const user = getCurrentUser();
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <div className="app">
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated() ? <Navigate to={getDefaultAuthenticatedPath()} replace /> : <Welcome />}
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                        path="/unauthorized"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Unauthorized />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <ProtectedAdminRoute>
                                    <AppLayout>
                                        <Dashboard />
                                    </AppLayout>
                                </ProtectedAdminRoute>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/tableau-de-bord"
                        element={
                            <ProtectedRoute>
                                <ProtectedAdminRoute>
                                    <AppLayout>
                                        <Dashboard />
                                    </AppLayout>
                                </ProtectedAdminRoute>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute>
                                <RoleRoute allowedRoles={['admin']}>
                                    <AppLayout>
                                        <Users />
                                    </AppLayout>
                                </RoleRoute>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/subscriptions"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Subscriptions />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/request-subscription"
                        element={
                            <ProtectedRoute>
                                <RoleRoute allowedRoles={['utilisateur']}>
                                    <AppLayout>
                                        <RequestSubscription />
                                    </AppLayout>
                                </RoleRoute>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/subscription-requests"
                        element={
                            <ProtectedRoute>
                                <RoleRoute allowedRoles={['admin']}>
                                    <AppLayout>
                                        <SubscriptionRequests />
                                    </AppLayout>
                                </RoleRoute>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <RoleRoute allowedRoles={['utilisateur']}>
                                    <AppLayout>
                                        <SubscriptionHistory />
                                    </AppLayout>
                                </RoleRoute>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Profile />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={isAuthenticated() ? <Navigate to={getDefaultAuthenticatedPath()} replace /> : <Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
