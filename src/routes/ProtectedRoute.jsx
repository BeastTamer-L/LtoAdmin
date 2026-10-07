import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, profile, loading } = useAuth();

  // If still loading auth state, show loading (could show a loading indicator)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Checking session...</p>
      </div>
    );
  }

  // If no user after loading, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length > 0) {
    const role = profile?.role || profile?.account_type || user.user_metadata?.role;
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated, show protected routes
  return <Outlet />;
}