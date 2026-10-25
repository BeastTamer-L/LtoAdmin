import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";

// Dropdown filter used by every list page's filter bar
// options: ["All", "Active", ...] (the value is the option text); onChange receives the chosen text
export default function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  className = "sm:ml-2 sm:w-[180px]",
  "aria-label": ariaLabel,
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel}
        className={`enforcers-select-trigger h-[38px] w-full rounded-lg px-3 py-2 text-[14px] shadow-none ring-offset-white ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="enforcers-select-options select-slide-down bg-white">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
