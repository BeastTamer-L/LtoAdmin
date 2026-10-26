import { useLocation } from "react-router-dom";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  IdentificationIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

// Ordered so more specific paths win; first match is used
const pages = [
  { path: "/violations", title: "Violations", description: "Violation types and penalties", icon: DocumentTextIcon },
  { path: "/license-database", title: "License Database", description: "LTO central driver license records", icon: IdentificationIcon },
  { path: "/vehicle-database", title: "Vehicle Database", description: "LTO central vehicle registration records", icon: TruckIcon },
  { path: "/audit-trail", title: "Audit Trail", description: "Record of administrative actions", icon: ShieldCheckIcon },
  { path: "/adjudication", title: "Adjudication", description: "Review and resolve contested tickets", icon: ScaleIcon },
];

export default function TopSection() {
  const { pathname } = useLocation();
  const page =
    pages.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`)) ?? pages[0];
  const Icon = page.icon;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className='bg-white w-full h-[73px] shrink-0 border-b border-slate-200/80 flex items-center justify-between gap-4 px-6'>
      <div className='flex items-center gap-3'>
        <Icon className='h-6 w-6 shrink-0 text-[#0F2744]' />
        <div className='leading-tight'>
          <h1 className='text-[16px] font-bold tracking-tight text-[#0F2744]'>{page.title}</h1>
          <p className='text-sm font-medium text-slate-500 mt-0.5'>{page.description}</p>
        </div>
      </div>

      <div className='hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600'>
        <CalendarDaysIcon className='h-5 w-5' />
        <span>{today}</span>
      </div>
    </div>
  );
}
