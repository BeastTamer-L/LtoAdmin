import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/SideBar'
import TopSection from '../components/TopSection'

export default function DashboardLayout() {
  const location = useLocation()
  const isAuditTrail = location.pathname === '/audit-trail'
  const isCompanionMap = location.pathname === '/enforcers/companion-map'
  const isViolations = location.pathname === '/violations'
  const isAdjudication = location.pathname === '/adjudication'
  const isLicenseDatabase = location.pathname === '/license-database'
  const hasPageManagedSpacing =
    isAuditTrail ||
    isAdjudication ||
    isCompanionMap ||
    isViolations ||
    isLicenseDatabase
  const hasViewportManagedLayout =
    isAuditTrail ||
    isAdjudication ||
    isCompanionMap ||
    isViolations ||
    isLicenseDatabase

  return (
    <div className="bg-[#F0F4F8] w-full h-screen flex">
      <Sidebar />

      <div className={`flex min-w-0 flex-col w-full h-full ${hasViewportManagedLayout ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <TopSection />

        <div className={hasPageManagedSpacing ? 'min-h-0 flex-1' : 'px-6 py-6'}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}