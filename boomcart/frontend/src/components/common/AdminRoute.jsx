import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ requireSuperAdmin = false }) {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/admin" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
