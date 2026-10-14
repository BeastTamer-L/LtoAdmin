import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Enforcers from '../pages/EnforcersPage'
import Ticket from '../pages/TicketPage'
import TicketDetails from '../pages/TicketDetails'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/DashboardPage'
import ReportPage from '../pages/ReportPage'
import SecurityMonitorPage from '../pages/SecurityMonitorPage'
import ActivateAccountPage from '../pages/ActivateAccountPage'
import PageLayout from '../layouts/PageLayout'
import ProtectedRoute from "./ProtectedRoute";
import LicenseDatabase from "../pages/LicenseDatabase";
import '../App.css'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />

        {/* Protected routes - requires authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PageLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - accessible to all authenticated roles */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Enforcers management - admin and superadmin only */}
            <Route
              path="/enforcers"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<Enforcers />} />
            </Route>

            {/* Ticket viewing - all authenticated roles can view */}
            <Route path="/tickets" element={<Ticket />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />

            {/* Reports - admin and superadmin only */}
            <Route
              path="/reports"
              element={<ProtectedRoute allowedRoles={['superadmin', 'admin']} />}>
              <Route index element={<ReportPage />} />
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