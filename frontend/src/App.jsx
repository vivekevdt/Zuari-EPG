import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import EmployeeDashboard from './pages/EmployeeDashboard';
import LoginPage from './pages/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEntities from './pages/admin/AdminEntities';
import AdminPolicies from './pages/admin/AdminPolicies';
import AdminInteractions from './pages/admin/AdminInteractions';
import AdminEmployees from './pages/admin/AdminEmployees';
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminVectorDb from './pages/superadmin/SuperAdminVectorDb';

const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'superAdmin') return <Navigate to="/" replace />;

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />; // Strict check, or allow superAdmin? User specified separate role.

  return children;
};

const EmployeeRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'superAdmin') return <Navigate to="/super-admin/dashboard" replace />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'superAdmin') return <Navigate to="/super-admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        {/* Employee Routes */}
        <Route path="/" element={
          <EmployeeRoute>
            <EmployeeDashboard />
          </EmployeeRoute>
        } />


        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="entities" element={<AdminEntities />} />
          <Route path="policies" element={<AdminPolicies />} />

          <Route path="interactions" element={<AdminInteractions />} />
          <Route path="employees" element={<AdminEmployees />} />
        </Route>

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={
          <SuperAdminRoute>
            <SuperAdminLayout />
          </SuperAdminRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="vector-db" element={<SuperAdminVectorDb />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
