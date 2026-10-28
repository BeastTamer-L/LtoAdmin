import Logo from "../assets/logo.png";

import {
  ShieldCheck,
  LogOut,
  ChevronLeft,
  Scale,
  IdCard,
  CarFront,
} from "lucide-react";

import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import LogoutModal from "./LogoutModal";

const menuItems = [
  {
    name: "Violations",
    icon: DocumentTextIcon,
    path: "/violations",
  },
  {
    name: "License Database",
    icon: IdCard,
    path: "/license-database",
  },
  {
    name: "Vehicle Database",
    icon: CarFront,
    path: "/vehicle-database",
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
];


export default function Sidebar() {
  const location = useLocation();
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
      await supabase.auth.signOut({ scope: 'local' });
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
        relative
        h-screen
        bg-[#102D4A]
        text-white
        flex flex-col
        border-r border-[#29435F]
        transition-all duration-500 ease-in-out
        shrink-0
        ${collapsed ? "w-[80px]" : "w-[260px]"}
      `}
    >

      <div
        className={`
          h-[88px]
          flex items-center
          border-b border-[#29435F]
          px-[18px]
        `}
      >
        <div className="w-full flex items-center">
          {/* Logo + brand name: the logo keeps one size and position, the brand text slides and fades with the panel */}
          <div className="flex items-center">
            <img
              src={Logo}
              alt="CAMOTE road and aperture logo"
              className="h-10 w-10 shrink-0 object-contain"
            />

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[150px] opacity-100"
              }`}
            >
              <div className="w-[150px]">
                <h2 className="text-right text-[21px] font-black leading-none tracking-tight" style={{ fontFamily: '"TT Hoves", sans-serif' }}>
                  <span className="italic text-orange-500">CAM</span>
                  <span className="ml-[2px] text-white">OTE</span>
                </h2>
                <div className="mt-1 ml-auto flex w-[88%] flex-col items-end gap-[2px]" aria-hidden="true">
                  <span className="h-[3px] w-[62px] bg-white" />
                  <span className="h-[3px] w-[40px] bg-orange-500" />
                </div>
                <p className="mt-1.5 whitespace-nowrap text-right text-[9px] font-medium tracking-wide text-slate-300">
                  A Simulated LTO Environment
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* One toggle that slides and rotates with the sidebar width */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`
            absolute
            z-20
            flex
            items-center
            justify-center
            rounded-full
            border
            p-1
            cursor-pointer
            transition-all duration-500 ease-in-out
            hover:scale-110
            active:scale-90
            ${
              collapsed
                ? "left-[68px] top-[28px] border-[#F96800] bg-[#F96800] text-white hover:border-[#EE6500] hover:bg-[#EE6500]"
                : "left-[212px] top-[30px] border-transparent bg-transparent text-[#B4C0CC] hover:bg-[#1a3b5c] hover:text-white"
            }
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={19}
            strokeWidth={1.8}
            className={`transition-transform duration-500 ease-in-out ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`
          flex-1
          pt-7
          transition-all duration-500
          ${collapsed ? "px-3" : "px-3"}
        `}
      >
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isItemActive = (isActive) =>
              item.matchPaths
                ? item.matchPaths.some((p) => location.pathname === p || location.pathname.startsWith(`${p}/`))
                : isActive;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={({ isActive: routeActive }) => {
                  const isActive = isItemActive(routeActive);
                  return `
                  flex
                  w-full
                  items-center
                  rounded-lg
                  py-2.5
                  text-sm
                  tracking-wide
                  transition-all duration-500 ease-in-out
                  active:scale-[0.98]
                  overflow-hidden
                  pl-[18px] pr-3
                  ${
                    isActive
                      ? "bg-white text-[#EE6500] font-bold shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium"
                  }
                `;
                }}
              >
                {({ isActive: routeActive }) => {
                  const isActive = isItemActive(routeActive);
                  return (
                  <>
                    <Icon
                      className={`h-5 w-5 shrink-0 stroke-[1.75] ${
                        isActive
                          ? "text-[#EE6500]"
                          : "text-slate-400"
                      }`}
                    />

                    {/* Always rendered so the label slides and fades with the panel instead of popping in */}
                    <span
                      className={`overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out ${
                        collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-[170px] opacity-100"
                      }`}
                    >
                      {item.name}
                    </span>
                  </>
                  );
                }}
              </NavLink>
              
            );
          })}
        </nav>
      </div>
      
      

      <div className="px-3">
        {/* Divider */}
        <div className="border-t border-[#29435F] mb-5" />

        <div
          className={`
            mb-3
            flex
            items-center
            rounded-xl
            border border-slate-700/50
            bg-slate-800/40
            py-3 px-[9px]
            overflow-hidden
            transition-all duration-500
          `}
        >
          {/* Avatar */}
          <div
          onClick={() => setCollapsed(false)}
          className="w-9 h-9 rounded-full bg-[#EE6500] flex items-center justify-center shrink-0">
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

          {/* Logout: keeps its size and sticks to the card's right edge, so it rides along with the panel (the card clips it) while it fades */}
          <div
            className={`ml-auto shrink-0 transition-opacity duration-500 ease-in-out ${
              collapsed ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            aria-hidden={collapsed}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              tabIndex={collapsed ? -1 : 0}
              className="
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
          </div>
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