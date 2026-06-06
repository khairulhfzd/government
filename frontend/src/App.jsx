import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WelcomePage from './pages/WelcomePage';

// Warga pages
import WargaDashboard from './pages/warga/Dashboard';
import WargaLapor from './pages/warga/Lapor';
import WargaRiwayat from './pages/warga/Riwayat';
import WargaPengajuan from './pages/warga/Pengajuan';
import WargaPengajuanBaru from './pages/warga/PengajuanBaru';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTiket from './pages/admin/Tiket';
import AdminTiketDetail from './pages/admin/TiketDetail';
import AdminPengajuan from './pages/admin/Pengajuan';
import AdminPengajuanDetail from './pages/admin/PengajuanDetail';

// Guards
const PrivateRoute = ({ children, role }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }
  return children;
};

function AppRoutes() {
  const { user, token } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={
        token ? <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/'} replace /> : <LoginPage />
      } />
      <Route path="/register" element={
        token ? <Navigate to="/" replace /> : <RegisterPage />
      } />

      {/* Warga Routes */}
      <Route path="/warga/dashboard" element={
        <Navigate to="/" replace />
      } />
      <Route path="/warga/lapor" element={
        <PrivateRoute role="warga"><WargaLapor /></PrivateRoute>
      } />
      <Route path="/warga/pengajuan" element={
        <PrivateRoute role="warga"><WargaPengajuan /></PrivateRoute>
      } />
      <Route path="/warga/pengajuan/baru" element={
        <PrivateRoute role="warga"><WargaPengajuanBaru /></PrivateRoute>
      } />
      <Route path="/warga/riwayat" element={
        <PrivateRoute role="warga"><WargaRiwayat /></PrivateRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>
      } />
      <Route path="/admin/tiket" element={
        <PrivateRoute role="admin"><AdminTiket /></PrivateRoute>
      } />
      <Route path="/admin/tiket/:id" element={
        <PrivateRoute role="admin"><AdminTiketDetail /></PrivateRoute>
      } />
      <Route path="/admin/pengajuan" element={
        <PrivateRoute role="admin"><AdminPengajuan /></PrivateRoute>
      } />
      <Route path="/admin/pengajuan/:id" element={
        <PrivateRoute role="admin"><AdminPengajuanDetail /></PrivateRoute>
      } />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

import FloatingChatbot from './components/FloatingChatbot';

function AppContent() {
  const { token, user } = useAuth();
  
  return (
    <>
      <AppRoutes />
      {token && user?.role === 'warga' && <FloatingChatbot />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

