import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // If still loading auth state, show loading (could show a loading indicator)
  if (loading) {
    return <Navigate to="/login" replace />; // Temporary redirect during loading
  }

  // If no user after loading, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, show protected routes
  return <Outlet />;
}