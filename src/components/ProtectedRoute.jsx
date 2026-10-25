import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * @param {Object} props - Route props
 * @param {string[]} [props.allowedRoles] - Array of allowed roles (e.g., ['superadmin', 'admin'])
 * @param {string} [props.redirectTo] - Path to redirect if unauthorized (default: '/access-denied')
 * @param {boolean} [props.redirectIfAuthenticated] - If true, redirects authenticated users away (for login/register pages)
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/access-denied',
  redirectIfAuthenticated = false
}) {
  const { user, profile, loading } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth initialization to complete
  useEffect(() => {
    if (!loading) {
      setAuthReady(true);
    }
  }, [loading]);

  // Show loading state while checking auth
  if (!authReady) {
    return <Navigate to="/login" replace />;
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If this route should redirect authenticated users away (like login page)
  if (redirectIfAuthenticated && user) {
    return <Navigate to="/violations" replace />;
  }

  // If no role restrictions, render children
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Check if user has any of the allowed roles
  const hasAllowedRole = allowedRoles.some(role =>
    profile?.role === role
  );

  // If user doesn't have required role, show access denied
  if (!hasAllowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-[#EF4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#991B1B]">Access Denied</h1>
          <p className="text-[#6B7280]">
            You don't have permission to access this page.
            Required roles: {allowedRoles.map(r =>
              r.charAt(0).toUpperCase() + r.slice(1)
            ).join(', ')}
          </p>
          <div className="mt-8">
            <a
              href="/dashboard"
              className="inline-block px-4 py-2 bg-[#EF4444] text-white rounded-md hover:bg-[#DC2620] focus:outline-none focus:ring-2 focus:ring-[#EF4444] focus:ring-offset-2 transition-colors duration-200"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role
  return <Outlet />;
}