import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TicketDetails from '../pages/TicketDetails'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/DashboardPage'
import SecurityMonitorPage from '../pages/SecurityMonitorPage'
import ActivateAccountPage from '../pages/ActivateAccountPage'
import ForgotPasswordPage from '../pages/ForgotPasswordPage'
import PageLayout from '../layouts/PageLayout'
import ProtectedRoute from "./ProtectedRoute";
import LicenseDatabase from "../pages/LicenseDatabase";
import VehicleDatabase from "../pages/VehicleDatabase";
import AuditTrail from "../pages/AuditTrail";
import Adjudication from "../pages/Adjudication";
import Violations from "../pages/Violations";
import '../App.css'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes - requires authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - accessible to all authenticated roles */}
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/tickets/:id" element={<TicketDetails />} />

            {/* Adjudication - admin and superadmin only */}
            <Route
              path="/adjudication"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<Adjudication />} />
            </Route>

            {/* Security Monitoring - admin and superadmin only */}
            <Route
              path="/security"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<SecurityMonitorPage />} />
            </Route>

            {/* License Database - admin and superadmin only */}
            <Route
              path="/license-database"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<LicenseDatabase />} />
            </Route>
            <Route
              path="/vehicle-database"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<VehicleDatabase />} />
            </Route>
            {/* Audit Trail - admin and superadmin only */}
            <Route
              path="/audit-trail"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<AuditTrail />} />
            </Route>

            {/* Violations - admin and superadmin only */}
            <Route
              path="/violations"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<Violations />} />
            </Route>
            

            {/* Example: Superadmin only route */}
            {/*
            <Route
              path="/system-settings"
              element={<ProtectedRoute allowedRoles={['superadmin']} />}>
                <SystemSettings />
            </Route>
            */}
          </Route>
        </Route>

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}