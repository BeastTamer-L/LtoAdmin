import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS_PER_PAGE = 12;

// Values are plain YYYY-MM-DD strings (the same shape as <input type="date"> and the violation_date column)
const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fromKey = (key) => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatLabel = (key) =>
  fromKey(key).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  align = "left",
  className = "",
  triggerClassName = "h-10 w-[170px] text-sm",
  "aria-label": ariaLabel,
}) {
  const containerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => (value ? fromKey(value) : new Date()));
  // "days" is the calendar; clicking the title drills out to the month list, then the year list
  const [view, setView] = useState("days");

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const toggleOpen = () => {
    // Reopen on the selected month (or this month when nothing is selected)
    if (!open) {
      setViewMonth(value ? fromKey(value) : new Date());
      setView("days");
    }
    setOpen((current) => !current);
  };

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const todayKey = toKey(new Date());
  const isDisabled = (key) => (min && key < min) || (max && key > max);

  const pick = (key) => {
    onChange?.(key);
    setOpen(false);
  };

  // The arrows move by a month, a year, or a page of years depending on the view
  const shiftView = (direction) => {
    if (view === "days") setViewMonth(new Date(year, month + direction, 1));
    else if (view === "months") setViewMonth(new Date(year + direction, month, 1));
    else setViewMonth(new Date(year + direction * YEARS_PER_PAGE, month, 1));
  };

  // The year list opens with the viewed year near the top rows, so nearby years are within reach either way
  const pageStartYear = year - 4;
  const minYear = min ? fromKey(min).getFullYear() : -Infinity;
  const maxYear = max ? fromKey(max).getFullYear() : Infinity;
  const isYearDisabled = (candidate) => candidate < minYear || candidate > maxYear;
  const isMonthDisabled = (index) => {
    const first = toKey(new Date(year, index, 1));
    const last = toKey(new Date(year, index + 1, 0));
    return (max && first > max) || (min && last < min);
  };

  const title =
    view === "days"
      ? viewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : view === "months"
        ? String(year)
        : "Select year";

  const selectedDate = value ? fromKey(value) : null;
  const optionClass = (active, disabled, current) =>
    `flex h-9 items-center justify-center rounded-lg text-xs font-medium transition ${
      active
        ? "cursor-pointer bg-[#0F2744] text-white"
        : disabled
          ? "cursor-not-allowed text-slate-300"
          : "cursor-pointer text-slate-700 hover:bg-slate-100"
    } ${current && !active ? "text-[#ED6704] ring-1 ring-[#ED6704]/40" : ""}`;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`flex ${triggerClassName} cursor-pointer items-center justify-between gap-2 rounded-lg border bg-[#F0F4F8] px-3 font-medium transition focus:outline-none focus:ring-2 focus:ring-[#ED6704] ${
          open ? "border-[#ED6704]" : "border-[#E2E8F0] hover:border-slate-300"
        } ${value ? "text-[#0F2744]" : "text-slate-400"}`}
      >
        <span className="truncate">{value ? formatLabel(value) : placeholder}</span>
        <CalendarDays size={16} className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a date"
          className={`absolute top-full z-30 mt-2 w-[268px] rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftView(-1)}
              aria-label="Previous"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView((current) => (current === "days" ? "months" : "years"))}
              disabled={view === "years"}
              aria-label="Choose month or year"
              className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold text-[#0F2744] transition hover:bg-slate-100 disabled:cursor-default disabled:hover:bg-transparent"
            >
              {title}
              {view !== "years" && <ChevronDown size={14} className="text-slate-400" />}
            </button>
            <button
              type="button"
              onClick={() => shiftView(1)}
              aria-label="Next"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {view === "months" && (
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((label, index) => {
                const disabled = isMonthDisabled(index);
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setViewMonth(new Date(year, index, 1));
                      setView("days");
                    }}
                    className={optionClass(
                      selectedDate?.getFullYear() === year && selectedDate.getMonth() === index,
                      disabled,
                      new Date().getFullYear() === year && new Date().getMonth() === index
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {view === "years" && (
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: YEARS_PER_PAGE }, (_, index) => pageStartYear + index).map((candidate) => {
                const disabled = isYearDisabled(candidate);
                return (
                  <button
                    key={candidate}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      setViewMonth(new Date(candidate, month, 1));
                      setView("months");
                    }}
                    className={optionClass(selectedDate?.getFullYear() === candidate, disabled, new Date().getFullYear() === candidate)}
                  >
                    {candidate}
                  </button>
                );
              })}
            </div>
          )}

          {view === "days" && (
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((day) => (
              <span key={day} className="pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {day}
              </span>
            ))}
            {cells.map((day, index) => {
              if (day === null) return <span key={`blank-${index}`} />;

              const key = toKey(new Date(year, month, day));
              const selected = key === value;
              const disabled = isDisabled(key);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(key)}
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition ${
                    selected
                      ? "cursor-pointer bg-[#0F2744] text-white"
                      : disabled
                        ? "cursor-not-allowed text-slate-300"
                        : "cursor-pointer text-slate-700 hover:bg-slate-100"
                  } ${key === todayKey && !selected ? "text-[#ED6704] ring-1 ring-[#ED6704]/40" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold">
            <button
              type="button"
              onClick={() => pick("")}
              className="cursor-pointer text-slate-500 transition hover:text-slate-700"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={isDisabled(todayKey)}
              onClick={() => pick(todayKey)}
              className="cursor-pointer text-[#ED6704] transition hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:no-underline"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
