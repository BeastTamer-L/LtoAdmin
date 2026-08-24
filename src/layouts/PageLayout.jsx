import { Outlet } from 'react-router-dom'
import Sidebar from '../components/SideBar'
import TopSection from '../components/TopSection'

export default function DashboardLayout() {
  return (
    <div className="bg-[#F0F4F8] w-full h-screen flex">
      <Sidebar />

      <div className="flex flex-col w-full h-full overflow-y-auto">
        <TopSection />

        <div className="px-6 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}