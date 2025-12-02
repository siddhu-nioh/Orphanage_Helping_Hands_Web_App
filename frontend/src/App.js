import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import OrphanageDirectory from './pages/OrphanageDirectory';
import OrphanageProfile from './pages/OrphanageProfile';
import AuthPage from './pages/AuthPage';
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorHistory from './pages/donor/DonorHistory';
import DonorProfile from './pages/donor/DonorProfile';
import DonationFlow from './pages/donor/DonationFlow';
import DonationSuccess from './pages/donor/DonationSuccess';
import OrphanageAdminDashboard from './pages/orphanage/OrphanageAdminDashboard';
import OrphanageManagement from './pages/orphanage/OrphanageManagement';
import ChildrenManagement from './pages/orphanage/ChildrenManagement';
import StaffManagement from './pages/orphanage/StaffManagement';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import OrphanageVerification from './pages/superadmin/OrphanageVerification';
import TransactionMonitoring from './pages/superadmin/TransactionMonitoring';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/orphanages" element={<OrphanageDirectory />} />
      <Route path="/orphanage/:slug" element={<OrphanageProfile />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Donor Routes */}
      <Route
        path="/donor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/history"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donor/profile"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonorProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donate/:orphanageId"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonationFlow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donation/success"
        element={
          <ProtectedRoute allowedRoles={['DONOR']}>
            <DonationSuccess />
          </ProtectedRoute>
        }
      />

      {/* Orphanage Admin Routes */}
      <Route
        path="/orphanage-admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ORPHANAGE_ADMIN']}>
            <OrphanageAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orphanage-admin/manage"
        element={
          <ProtectedRoute allowedRoles={['ORPHANAGE_ADMIN']}>
            <OrphanageManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orphanage-admin/children"
        element={
          <ProtectedRoute allowedRoles={['ORPHANAGE_ADMIN']}>
            <ChildrenManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orphanage-admin/staff"
        element={
          <ProtectedRoute allowedRoles={['ORPHANAGE_ADMIN']}>
            <StaffManagement />
          </ProtectedRoute>
        }
      />

      {/* Super Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/verification"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <OrphanageVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <TransactionMonitoring />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;