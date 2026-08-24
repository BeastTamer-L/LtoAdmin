import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Enforcers from '../pages/EnforcersPage'
import Ticket from '../pages/TicketPage'
import TicketDetails from '../pages/TicketDetails'
import LoginPage from '../pages/LoginPage'
import Dashboard from '../pages/DashboardPage'
import ReportPage from '../pages/ReportPage'
import PageLayout from '../layouts/PageLayout'
import ProtectedRoute from "./ProtectedRoute";
import '../App.css'
export default function AppRoutes() {

  return (
     <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Layout */}
        <Route element={<ProtectedRoute/>}>
            <Route element={<PageLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enforcers" element={<Enforcers />} />
            <Route path="/tickets" element={<Ticket />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
            <Route path="/reports" element={<ReportPage />} />


            {/* <Route path="/settings" element={<Settings />} /> */}
            {/* <Route path="/support" element={<Support />} /> */}
            </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />}/>
      </Routes>
    </BrowserRouter>
  )
}


