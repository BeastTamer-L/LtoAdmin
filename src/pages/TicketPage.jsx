import React, { useState } from 'react'
import { Search, Funnel } from "lucide-react";
import Table from '../components/Table'

export default function Ticket() {
    const [search, setSearch] = useState('');


    const columns = [
    {
        key: "ticketNo",
        label: "Ticket Number",
        render: (row) => (
            <span className="font-medium text-[#4F6AD8] font-semibold">
                {row.ticketNo}
            </span>
        )
    },
    {
        key: "licensePlate",
        label: "License Plate",
        render: (row) => (
            <span className="font-medium text-black font-semibold">
                {row.licensePlate}
            </span>
        )
    },
    {
        key: "violation",
        label: "Violation",
        render: (row) => (
            <span className="font-medium text-black block max-w-[150px] truncate">
                {row.violation}
            </span>
        )
        
    },
    {
        key: "violator",
        label: "Violator",
    },
    {
        key: "enforcer",
        label: "Enforcer",
    },
    {
        key: "dateIssued",
        label: "Date Issued",
    }
    ];

    const data = [
    {
        ticketNo: "TKT-2026-00124",
        licensePlate: "NCA 4821",
        violation: "Driving Without a Valid License",
        violator: "Juan Dela Cruz",
        enforcer: "PO2 Mark Santos",
        dateIssued: "August 21, 2026",
    },
    {
        ticketNo: "TKT-2026-00125",
        licensePlate: "ABC 1234",
        violation: "Illegal Parking",
        violator: "Maria Santos",
        enforcer: "PO1 Carlo Reyes",
        dateIssued: "August 21, 2026",
    },
    {
        ticketNo: "TKT-2026-00126",
        licensePlate: "XYZ 5678",
        violation: "Failure to Wear a Standard Motorcycle Helmet",
        violator: "Pedro Garcia",
        enforcer: "PO2 James Cruz",
        dateIssued: "August 20, 2026",
    },
    {
        ticketNo: "TKT-2026-00127",
        licensePlate: "DEF 9012",
        violation: "Disregarding Traffic Signs",
        violator: "Ana Reyes",
        enforcer: "PO1 Miguel Santos",
        dateIssued: "August 20, 2026",
    },
    {
        ticketNo: "TKT-2026-00128",
        licensePlate: "GHI 3456",
        violation: "Driving Against the Flow of Traffic",
        violator: "Carlos Mendoza",
        enforcer: "PO2 Daniel Ramos",
        dateIssued: "August 19, 2026",
    },
    {
        ticketNo: "TKT-2026-00129",
        licensePlate: "JKL 7890",
        violation: "Not Wearing a Seatbelt",
        violator: "Sofia Torres",
        enforcer: "PO1 Kevin Flores",
        dateIssued: "August 19, 2026",
    },
];
    

    return (
        <div className='bg-white w-full h-full border-[1px] border-[#E2E8F0] px-6 py-6 rounded-lg'>
            <div className='flex items-center justify-between mb-[60px]'>
                
                <div className='relative flex items-center'>
                    <Search className="text-[#7E8998] absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by plate, Id or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[350px] bg-[#F0F4F8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED6704] text-[14px] text-[#475569] pl-[50px] pr-5 py-2"
                    />

                    <button className="py-2 px-5 bg-[#ED6704] text-white rounded-lg ml-2 hover:bg-[#ED6704]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-2 text-[14px] active:scale-[0.98]">
                        <Funnel className="w-4 h-4 text-white" />
                        Filter
                    </button>

                </div>
            </div>
            <Table columns={columns} data={data} />
            
        </div>
    )
}