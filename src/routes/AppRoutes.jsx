import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from '../pages/LoginPage'
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
import { LTO_ROLES } from "../lib/adminAccess";

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
            <Route path="/" element={<Navigate to="/violations" replace />} />

            {/* Adjudication - admin and superadmin only */}
            <Route
              path="/adjudication"
              element={<ProtectedRoute allowedRoles={LTO_ROLES} />}>
              <Route index element={<Adjudication />} />
            </Route>

            {/* License Database - admin and superadmin only */}
            <Route
              path="/license-database"
              element={<ProtectedRoute allowedRoles={LTO_ROLES} />}>
              <Route index element={<LicenseDatabase />} />
            </Route>
            <Route
              path="/vehicle-database"
              element={<ProtectedRoute allowedRoles={LTO_ROLES} />}>
              <Route index element={<VehicleDatabase />} />
            </Route>
            {/* Audit Trail - admin and superadmin only */}
            <Route
              path="/audit-trail"
              element={<ProtectedRoute allowedRoles={LTO_ROLES} />}>
              <Route index element={<AuditTrail />} />
            </Route>

            {/* Violations - admin and superadmin only */}
            <Route
              path="/violations"
              element={<ProtectedRoute allowedRoles={LTO_ROLES} />}>
              <Route index element={<Violations />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}