import { useState } from "react";
import Logo from "../assets/logo.png";
import {LayoutDashboard,
  UsersRound,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  Grid2X2,
  LogOut,
} from "lucide-react";





const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Enforcers",
    icon: UsersRound,
  },
  {
    name: "Violations",
    icon: ClipboardList,
  },
  {
    name: "Reports",
    icon: FileText,
  },
];
{/*{
    name: "Backup Logs",
    icon: BarChart3,
  },*/
}


const bottomItems = [
  {
    name: "Settings",
    icon: Settings,
  },
  {
    name: "Support center",
    icon: ShieldCheck,
  },
];

export default function Sidebar() {
  const [active, setActive] = useState("Dashboard");


  return (
    <aside className="w-full max-w-[260px] h-screen bg-[#102D4A] text-white flex flex-col border-r border-[#29435F]">
        
    {/* Top Section */}
      <div className="h-[88px] px-7 flex items-center border-b border-[#29435F]">
        <div className="flex items-center gap-4">

          <div className="relative w-10 h-10 flex items-center justify-center">
            <img src={Logo} alt="Logo" className="w-full h-full" />
          </div>

          <div>
            <h1 className="text-[18px] font-bold">
              Traffi<span className="text-[#F96800]">Cam</span>
            </h1>

            <p className="text-[12px]  text-[#F5F7FA]">
              North Caloocan
            </p>
          </div>

        </div>
      </div>


      {/* Main Navigation */}
      <div className="flex-1 px-3 pt-7">

        <p className="text-[9px] tracking-[3px] text-[#7F94A9] px-3 mb-4">
          MAIN MENU
        </p>

        <nav className="space-y-1">

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
            <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`
                    w-full h-11 px-3 rounded-lg
                    flex items-center gap-4
                    text-sm
                    transition-all duration-200
                    ${
                    active === item.name
                        ? "bg-white text-[#F96800] font-semibold shadow-sm"
                        : "text-[#B4C0CC] hover:bg-[#1A3958] hover:text-white font-medium"
                    }
                `}
            >             
            <Icon
                size={19}
                strokeWidth={1.8}
                className={`${active === item.name ? "text-[#F96800]" : "text-[#A8B6C5]"}`}
            />

                <span>{item.name}</span>
              </button>
            );
          })}

        </nav>
      </div>


      {/* Bottom Section */}
      <div className="px-3">
        <div className="border-t border-[#29435F] mb-5" />

        <nav className="space-y-1 mb-4">

          {bottomItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => setActive(item.name)}
                className={`
                    w-full h-11 px-3 rounded-lg
                    flex items-center gap-4
                    text-sm
                    transition-all duration-200
                    ${
                    active === item.name
                        ? "bg-white text-[#F96800] font-semibold shadow-sm"
                        : "text-[#B4C0CC] hover:bg-[#1A3958] hover:text-white font-medium"
                    }
                `}
              >
                <Icon
                  size={19}
                  strokeWidth={1.8}
                  className={`${active === item.name ? "text-[#F96800]" : "text-[#A8B6C5]"}`}
                />

                <span>{item.name}</span>
              </button>
            );
          })}

        </nav>


        {/* User Profile */}
        <div className="mb-3 h-[60px] rounded-lg bg-[#294663] px-3 flex items-center gap-3">

          <div className="w-9 h-9 rounded-full bg-[#F96800] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              JD
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              James Doe
            </p>

            <p className="text-[11px] text-[#9FB0C0]">
              Administrator
            </p>
          </div>
          <LogOut className="w-5 h-5 text-[#B4C0CC] hover:text-white ml-auto"/>

        </div>

      </div>

    </aside>
  );
}