import { useLocation } from "react-router-dom";

export default function TopSection() {
  const location = useLocation();

  const getPageName = (pathname) => {
    if (pathname.startsWith("/dashboard")) {
      return "Dashboard";
    }

    if (pathname.startsWith("/enforcers")) {
      return "Enforcers";
    }

    if (pathname.startsWith("/tickets")) {
      return "Tickets";
    }

    if (pathname.startsWith("/reports")) {
      return "Reports";
    }

    if (pathname.startsWith("/settings")) {
      return "Settings";
    }

    if (pathname.startsWith("/support")) {
      return "Support Center";
    }

    return "Dashboard";
  };

  const activeTab = getPageName(location.pathname);

  return (
   <div className='bg-white w-full border-b-[1px] border-[#D9D9D9] flex items-center px-6 py-6'>
      <div>
        <h1 className='text-lg font-semibold text-[16px]'>
          {activeTab}
        </h1>
      </div>
    </div>
  );
}