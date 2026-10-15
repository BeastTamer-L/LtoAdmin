import { useState } from "react";
import StatCard from "../components/StatCard"
import EnforcerCard from "../components/EnforcerCard";
import DateRangeSelect from "../components/DateRangeSelect";
import { IdCardLanyard, Ticket, CircleAlert, Phone, MoveRight } from "lucide-react"

export default function Dashboard(){
    const [dateRange, setDateRange] =  useState("Last 30 days");

    const enforcers = [
    {
        id: 1,
        name: "San Jose D. Elmonte",
        location: "Caloocan",
        battery: 80,
        isOnline: true,
    },
    {
        id: 2,
        name: "Arthur Nery",
        location: "North Caloocan",
        battery: 92,
        isOnline: true,
    },
    {
        id: 3,
        name: "Mark Anthony Santos",
        location: "Barangay 176",
        battery: 67,
        isOnline: true,
    },
    {
        id: 4,
        name: "John Carlo Reyes",
        location: "Novaliches",
        battery: 45,
        isOnline: true,
    },



    ];

    // Calculate total enforcers and active enforcers
    const totalEnforcers = enforcers.length;
    const activeEnforcers = enforcers.filter(enforcer => enforcer.isOnline).length;

    const data = [
        {
            id: "totalEnforcers",
            title: "Total Enforcers",
            value: totalEnforcers,
            subtitle: `${activeEnforcers} active`,
            icon: IdCardLanyard,
            color: '#4560B9'

        },
        {
            id: "ticketsToday",
            title: "Tickets Today",
            value: 3,
            subtitle: "February 16, 2026",
            icon: Ticket,
            color: '#ED6704'

        },
        {
            id: "violationsThisMonth",
            title: "Violations This Month",
            value: 5,
            subtitle: "+ 20% vs this month",
            icon: CircleAlert,
            color: '#EF4444'

        },
        {
            id: "backupRequest",
            title: "Backup Request",
            value: 10,
            subtitle: "this month",
            icon: Phone,
            color: '#8B5CF6'

        }
    ]

    return(
        <div className='w-full h-full'>
            <div className="grid grid-cols-4 gap-4 mb-6">
                 {
                    data.map(item => (
                        <StatCard
                            key={item.id}
                            title={item.title}
                            value={item.value}
                            subtitle={item.subtitle}
                            icon={item.icon}
                            color={item.color}
                        />
                    ))
                }
            </div>
            <div className="grid grid-cols-7 gap-4 mb-6">
                <div className="w-full h-[350px] rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs col-span-4">
                    <div className="flex items-center justify-between text-[12px]">
                        <span>VIOLATION HOTSPOT MAP - NORTH CALOOCAN</span>
                        <span className="py-1 px-4 bg-[#5FCC5F] text-white font-semibold rounded-sm">Live</span>
                    </div>
                </div>
                <div className="w-full h-[350px] max-h-[350px] overflow-hidden  rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs col-span-3">
                    <div className="flex items-center justify-between text-[12px] mb-4">
                        <span>ACTIVE ENFORCERS</span>
                        <button className="flex gap-3 text-[#4F6AD8] transition active:scale-[0.98]">
                            View All
                            <MoveRight className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-2">
                        {
                            enforcers.map((enforcer) => (
                                <EnforcerCard
                                    key={enforcer.id}
                                    {...enforcer}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="w-full h-[350px] rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs">
                    <div className="flex items-center justify-between text-[12px]">
                        <span>VIOLATIONS OVERVIEW </span>
                        <DateRangeSelect
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full h-[350px] rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs">
                        <span className="text-[12px]">TOP VIOLATIONS TYPE</span>
                </div>
            </div>


        </div>
    )
}