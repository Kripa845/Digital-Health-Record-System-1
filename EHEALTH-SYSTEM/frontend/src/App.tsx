import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { RoleSelectLogin } from './pages/RoleSelectLogin';
import { AdminLogin } from './pages/AdminLogin';
import { PatientLogin } from './pages/PatientLogin';
import { DoctorLogin } from './pages/DoctorLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPatientManagement } from './pages/AdminPatientManagement';
import { AdminDoctorManagement } from './pages/AdminDoctorManagement';
import { AdminRecommendations } from './pages/AdminRecommendations';
import { DoctorDashboard, MyPatients, DoctorProfile } from './pages/DoctorDashboard';
import { PatientPortal } from './pages/PatientPortal';
import { SharedProfile } from './pages/SharedProfile';
import { AdminLayout } from './components/admin/AdminLayout';
import { DoctorLayout } from './components/doctor/DoctorLayout';
import { PatientLayout } from './components/patient/PatientLayout';

const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/shared-profile/:token" element={<SharedProfile />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<RoleSelectLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/login/patient" element={<PatientLogin />} />
            <Route path="/login/doctor" element={<DoctorLogin />} />
            <Route path="/register" element={<Navigate to="/" replace />} />

            <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="patients" element={<AdminPatientManagement />} />
              <Route path="doctors" element={<AdminDoctorManagement />} />
              <Route path="recommendations" element={<AdminRecommendations />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>

            <Route path="/doctor" element={<ProtectedRoute allowedRole="DOCTOR"><DoctorLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="my-patients" element={<MyPatients />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route index element={<Navigate to="/doctor/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
            </Route>

            <Route path="/patient" element={<ProtectedRoute allowedRole="PATIENT"><PatientLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PatientPortal />} />
              <Route path="my-qr" element={<PatientPortal />} />
              <Route index element={<Navigate to="/patient/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
