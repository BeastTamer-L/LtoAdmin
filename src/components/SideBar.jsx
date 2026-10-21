import Logo from "../assets/logo.png";

import {
  LayoutDashboard,
  UsersRound,
  FileText,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  IdCard,
  Ticket,
  Scale,
} from "lucide-react";

import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import LogoutModal from "./LogoutModal";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Enforcers",
    icon: UsersRound,
    path: "/enforcers",
  },
  {
    name: "Tickets",
    icon: Ticket,
    path: "/tickets",
  },
  {
    name: "Violations",
    icon: FileText,
    path: "/violations",
  },
  
  {
    name: "Reports",
    icon: FileText,
    path: "/reports",
  },
  {
  name: "Audit Trail",
  path: "/audit-trail",
  icon: ShieldCheck,
  },
  {
    name: "Adjudication",
    icon: Scale,
    path: "/adjudication",
  },
  {
    name: "Security Monitor",
    icon: Eye,
    path: "/security",
  },
  {
  name: "License Database",
  icon: IdCard,
  path: "/license-database",
},
];


const bottomItems = [
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
  {
    name: "Support center",
    icon: ShieldCheck,
    path: "/support",
  },
];

export default function Sidebar() {
  // Initialize collapsed state from localStorage or default to false
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch (error) {
      console.warn('Failed to read sidebar state from localStorage:', error);
      return false;
    }
  });

  // Update localStorage whenever collapsed state changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [collapsed]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { profile, loading } = useAuth();

  const navigate = useNavigate();

  const handleConfirm = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsModalOpen(false);
      navigate("/login");
    }
  };

  return (
    <aside
      className={`
        h-screen
        bg-[#102D4A]
        text-white
        flex flex-col
        border-r border-[#29435F]
        transition-all duration-300 ease-in-out
        shrink-0
        ${collapsed ? "w-[80px]" : "w-[260px]"}
      `}
    >

      <div
        className={`
          h-[88px]
          flex items-center
          border-b border-[#29435F]
          transition-all duration-300
          ${collapsed ? "px-3" : "px-5"}
        `}
      >
        <div
          className={`
            w-full
            flex items-center
            ${collapsed ? "justify-center" : "justify-between"}
          `}
        >
          {/* Logo + Title */}
          <div
            className={`
              flex items-center
              ${collapsed ? "justify-center" : "gap-4"}
            `}
          >
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <img
                src={Logo}
                alt="CAMOTE Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {!collapsed && (
              <div className="flex flex-col">
                <h2 className="text-2xl font-black tracking-tight leading-none" style={{ fontFamily: '"TT Hoves", sans-serif' }}>
                  <span className="italic text-orange-500">CAM</span>
                  <span className="ml-[2px] text-white">OTE</span>
                </h2>
                {/* Split Accent Lines */}
                <div className="mt-1 flex flex-col items-start gap-0.5" aria-hidden="true">
                  <span className="h-1 w-[48px] bg-white/80 rounded-full" />
                  <span className="h-1 w-[32px] bg-orange-500 rounded-full" />
                </div>
                <span className="mt-1 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                  North Caloocan
                </span>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`
              p-1
              rounded-full
              text-[#B4C0CC]
              hover:text-white
              hover:bg-[#1A3958]
              transition-all duration-200
              ${collapsed ? "hidden" : "block"}
            `}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={19} strokeWidth={1.8} />
          </button>
        </div>

        {/* Expand Button */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="
              absolute
              left-[68px]
              top-[28px]
              z-20
              p-1
              rounded-full
              bg-[#102D4A]
              border border-[#29435F]
              text-[#B4C0CC]
              hover:text-white
              hover:bg-[#1A3958]
              transition-all duration-200
            "
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} strokeWidth={1.8} />
          </button>
        )}
      </div>

      <div
        className={`
          flex-1
          pt-7
          transition-all duration-300
          ${collapsed ? "px-3" : "px-3"}
        `}
      >
        {/* Main Menu Label */}
        {!collapsed && (
          <p className="text-[9px] tracking-[3px] text-[#7F94A9] px-3 mb-4">
            MAIN MENU
          </p>
        )}

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) => `
                  w-full
                  h-11
                  rounded-lg
                  flex
                  items-center
                  transition-all duration-200
                  active:scale-[0.98]
                  ${
                    collapsed
                      ? "justify-center px-0"
                      : "gap-4 px-3"
                  }
                  ${
                    isActive
                      ? "bg-white text-[#F96800] font-semibold shadow-sm"
                      : "text-[#B4C0CC] hover:bg-[#1A3958] hover:text-white font-medium"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className={
                        isActive
                          ? "text-[#F96800]"
                          : "text-[#A8B6C5]"
                      }
                    />

                    {!collapsed && (
                      <span className="whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
              
            );
          })}
        </nav>
      </div>
      
      

      <div className="px-3">
        {/* Divider */}
        <div className="border-t border-[#29435F] mb-5" />

        {/* Bottom Navigation */}
        <nav className="space-y-1 mb-4">
          {bottomItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) => `
                  w-full
                  h-11
                  rounded-lg
                  flex
                  items-center
                  transition-all duration-200
                  active:scale-[0.98]
                  ${
                    collapsed
                      ? "justify-center px-0"
                      : "gap-4 px-3"
                  }
                  ${
                    isActive
                      ? "bg-white text-[#F96800] font-semibold shadow-sm"
                      : "text-[#B4C0CC] hover:bg-[#1A3958] hover:text-white font-medium"
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className={
                        isActive
                          ? "text-[#F96800]"
                          : "text-[#A8B6C5]"
                      }
                    />

                    {!collapsed && (
                      <span className="whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div
          className={`
            mb-3
            h-[60px]
            rounded-lg
            bg-[#294663]
            flex
            items-center
            transition-all duration-300
            ${collapsed ? "justify-center px-0" : "px-3 gap-3"}
          `}
        >
          {/* Avatar */}
          <div
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 rounded-full bg-[#F96800] flex items-center justify-center shrink-0">
            {!loading && profile ? (
              <span className="text-xs font-bold text-white">
                {profile.first_name?.charAt(0) || '?'}{profile.last_name?.charAt(0) || '?'}
              </span>
) : (
              <span className="text-xs font-bold text-white">
                JD
              </span>
)}
            </div>

          {/* Logout */}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="
                ml-auto
                p-2
                rounded-full
                cursor-pointer
                hover:bg-white/20
                transition-all duration-200
              "
              aria-label="Log out"
            >
              <LogOut
                className="w-5 h-5 text-[#B4C0CC]"
              />
            </button>
          )}
        </div>
      </div>

      <LogoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      />
    </aside>
  );
}