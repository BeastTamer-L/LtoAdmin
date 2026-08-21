import { ChevronDown } from "lucide-react";

export default function DateRangeSelect({ value = "Last 30 days", onChange }) {
  return (
    <div className="relative w-32">
    <select
        value={value}
        onChange={onChange}
        className="h-9 w-32 appearance-none rounded-lg border border-[#D9E1EA] bg-white px-5 pr-9 text-xs text-[#102B4C] outline-none cursor-pointer focus:border-[#102B4C]"
    >
        <option>Last 7 days</option>
        <option>Last 30 days</option>
        <option>Last 90 days</option>
        <option>This year</option>
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"/>
</div>
  );
}