import { useState } from "react"
import { Download } from "lucide-react"
import StatCard from "../components/StatCard";


export default function ReportPage({onApply}){

    const [fromDate, setFromDate] = useState("2026-01-01");
    const [toDate, setToDate] = useState("2026-01-01");

    const handleApply = () => {
        const filters = {
        from: fromDate,
        to: toDate,
        };

        console.log("Applied filters:", filters);
        onApply?.(filters);
    };
    
    const data = [
        {
            id: "totalTickets",
            value: 120,
            title: "Total Tickets Issued",
            color: '#4560B9'

        },
        {
            id: "totalFines",
            value: "₱2,500",
            title: "Total fines assessed",
            color: '#000000'

        },
        {
            id: "violationsThisMonth",
            value: 5,
            title: "Fines Collected",
            color: '#15803D'

        },
        {
            id: "backupRequest",
            value: 10,
            title: "Unpaid Fines",
            color: '#F43F5E'

        }
    ]

    const [period, setPeriod] = useState("Yearly");
    const options = ["Yearly", "Monthly"];

    return(
        <div className='w-full h-full'>
            <div className='mb-6 bg-white w-full border-[1px] border-[#E2E8F0] px-6 py-6 rounded-lg flex items-center justify-between'>
                <div className="flex items-center gap-3">
                    {/* From */}
                    <label className="flex items-center gap-3">
                    <span className="text-sm text-[#4F5153] font-semibold">From</span>

                    <div className="relative">
                        <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        max={toDate}
                        className="h-10 w-[165px] rounded-md border border-[#E2E8F0] bg-[#F0F4F8] px-3 text-sm text-[#4F5153] outline-none"/>
                    </div>
                    </label>

                    {/* To */}
                    <label className="ml-4 flex items-center gap-3">
                    <span className="text-sm text-[#4F5153] font-semibold">To</span>

                    <div className="relative">
                        <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        min={fromDate}
                        className="h-10 w-[165px] rounded-md border border-[#E2E8F0] bg-[#F0F4F8] px-3 text-sm text-[#4F5153] outline-none"/>
                    </div>
                    </label>

                    {/* Apply */}
                    <button
                        type="button"
                        onClick={handleApply}
                        className="ml-1 h-10 rounded-md bg-[#0F2744] px-5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
                        >
                        Apply Filter
                    </button>
                </div>
                <button
                    type="button"
                    onClick={handleApply}
                    className="h-10 rounded-md bg-[#15803D] px-5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] flex items-center gap-2"
                    >
                        <Download className="w-5 h-5 text-white" />
                    Export CSV
                </button>
            </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                 {
                    data.map(item => (
                        <StatCard
                            key={item.id}
                            {...item}
                        />
                    ))
                }
            </div>

            <div className="grid grid-cols-7 gap-4 mb-6">
                <div className="w-full h-[350px] rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs col-span-4">
                    <div className="flex items-center justify-between text-[12px]">
                        <span>TICKET ISSUED TREND</span>
                        <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-[#F0F4F8] p-0.5">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setPeriod(option)}
                                    className={`px-5 py-1 text-[12px] font-medium transition-colors
                                        ${
                                            period === option
                                                ? "rounded-lg bg-[#102B4C] text-white"
                                                : "rounded-lg text-[#4F5153]"
                                        }
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full h-[350px] rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs col-span-3">
                        <span className="text-[12px]">TOP VIOLATIONS TYPE</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-[350px] rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs">
                    <span className="text-[12px]">VIOLATION TYPE BREAKDOWN</span>
                </div>
                <div className="w-full h-[350px] rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs">
                    <span className="text-[12px]">PENALTY & PAYMENT STATUS</span>
                </div>
            </div>
        </div>
    )
}