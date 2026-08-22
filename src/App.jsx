import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Login from './pages/LoginPage'
import Sidebar from './components/SideBar'
import TopSection from './components/TopSection'
import Enforcers from './pages/EnforcersPage'
import Ticket from './pages/TicketPage'
import TicketDetails from './pages/TicketDetails'
import StatCard from './components/StatCard'
import Dashboard from './pages/DashboardPage'
import ReportPage from './pages/ReportPage'
import './App.css'
function App() {

  return (
    <div className='bg-[#F0F4F8] w-full h-screen flex'>
      <Sidebar />
      <div className="flex flex-col w-full h-full overflow-y-auto">
        <TopSection activeTab={"Enforcers"}/>
        <div className='px-6 py-6'>
        <ReportPage  />
        </div>
      </div>
    </div>
  )
}

export default App
