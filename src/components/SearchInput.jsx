import { Search } from "lucide-react";

// Search box used by every list page's filter bar
export default function SearchInput({ value, onChange, placeholder, className = "sm:w-[350px]", ...props }) {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="text-[#7E8998] absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full bg-[#F0F4F8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED6704] text-[14px] text-[#475569] pl-[50px] pr-5 py-2 ${className}`}
        {...props}
      />
    </div>
  );
}
