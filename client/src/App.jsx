import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import SendAlert from './pages/SendAlert';
import Login from './pages/Login';
import EmergencyAlerts from './pages/EmergencyAlerts';
import BloodRequests from './pages/BloodRequests';
import BloodRequestDetail from './pages/BloodRequestDetail';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/Dashboard';
import CreateAlert from './pages/admin/CreateAlert';
import CreateBloodRequest from './pages/admin/CreateBloodRequest';
import ManageUsers from './pages/admin/ManageUsers';
import ViewResponses from './pages/admin/ViewResponses';

function AdminLoginRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (user && isAdmin) return <Navigate to="/admin" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/admin/login" />;
  if (!isAdmin) return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[#edf7ef]">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/send-alert" element={<SendAlert />} />
        <Route path="/emergency-alerts" element={<EmergencyAlerts />} />
        <Route path="/blood-requests" element={<BloodRequests />} />
        <Route path="/blood-requests/:id" element={<BloodRequestDetail />} />
        <Route path="/admin/login" element={<AdminLoginRoute><Login adminOnly /></AdminLoginRoute>} />
        <Route path="/profile" element={<AdminRoute><Profile /></AdminRoute>} />
        <Route path="/notifications" element={<AdminRoute><Notifications /></AdminRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/create-alert" element={<AdminRoute><CreateAlert /></AdminRoute>} />
        <Route path="/admin/create-blood-request" element={<AdminRoute><CreateBloodRequest /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
        <Route path="/admin/responses/:requestId" element={<AdminRoute><ViewResponses /></AdminRoute>} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/register" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
