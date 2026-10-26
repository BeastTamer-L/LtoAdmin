import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

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
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
          <p className="max-w-sm text-sm text-slate-500">Your account does not have access to this page. Sign out and use an administrator account.</p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="cursor-pointer rounded-md bg-[#0F2744] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#173A64]"
          >
            Sign out
          </button>
        </div>
      );
    }
  }

  // User is authenticated, show protected routes
  return <Outlet />;
}