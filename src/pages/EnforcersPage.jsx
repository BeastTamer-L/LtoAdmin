import {useState} from 'react'
import {Search, Funnel, UserRoundPlus} from "lucide-react";
import Table from '../components/Table'
import Logo from '../assets/logo.png'
import EnrollmentModal from '../components/EnrollmentModal'

export default function Enforcers() {
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false);


    const columns = [
    {
        key: "enforcer",
        label: "Enforcer",
        render: (row) => (
            <div className="flex items-center gap-3">
                <img
                src={row.profilePicture}
                alt={row.enforcer}
                className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                    <span className="font-medium text-black block font-semibold">
                    {row.enforcer}
                    </span>
                    <span className="font-medium text-gray-800 text-[12px]">
                    {row.email}
                    </span>
                </div>
            </div>
        )
    },
    {
        key: "badgeNo",
        label: "Badge Number",
    },
    {
        key: "status",
        label: "Status",
        render: (row) => (
        <span
            className={
                row.status === "Active"
                ? "rounded-full bg-[#15803D]/20 px-3 py-1 text-xs text-[#15803D] font-semibold"
                : "rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500 font-semibold"
            }
        >
        {row.status}
        </span>
        )
    },
    {
        key: "assignedArea",
        label: "Assigned Area",
    },
    {
        key: "lastActive",
        label: "Last Active",
    },
    ];

    const data = [
    {
        enforcer: "Juan Dela Cruz",
        badgeNo: "NC-1024",
        status: "Active",
        assignedArea: "Brgy. 176, Bagong Silang",
        lastActive: "Just now",
        email: "sarah.w@trafficam.gov",
        profilePicture: Logo
    },
    {
        enforcer: "Mark Anthony Santos",
        badgeNo: "NC-1025",
        status: "Active",
        assignedArea: "Novaliches Proper",
        lastActive: "2 mins ago",
        email: "mark.s@trafficam.gov",
        profilePicture: Logo
    },
    {
        enforcer: "Ramon Garcia",
        badgeNo: "NC-1026",
        status: "Offline",
        assignedArea: "Tala",
        lastActive: "15 mins ago",
        email: "mark.s@trafficam.gov",
        profilePicture: Logo  
    },
    {
        enforcer: "Carlo Reyes",
        badgeNo: "NC-1027",
        status: "Offline",
        assignedArea: "Brgy. 171, Bagumbong",
        lastActive: "1 hour ago",
        email: "mark.s@trafficam.gov",
        profilePicture: Logo  
    },
    {
        enforcer: "Michael Flores",
        badgeNo: "NC-1028",
        status: "Active",
        assignedArea: "Kaybiga",
        lastActive: "5 mins ago",
        email: "mark.s@trafficam.gov",
        profilePicture: Logo  
    },
    {
        enforcer: "Daniel Mendoza",
        badgeNo: "NC-1029",
        status: "Active",
        assignedArea: "Camarin",
        lastActive: "Just now",
        email: "mark.s@trafficam.gov",
        profilePicture: Logo
    },
    {
        enforcer: "Kevin Bautista",
        badgeNo: "NC-1030",
        status: "Offline",
        assignedArea: "Deparo",
        lastActive: "22 mins ago",
        email: "mark.s@trafficam.gov",
        profilePicture: Logo
    },
    {
        enforcer: "Patrick Villanueva",
        badgeNo: "NC-1031",
        status: "Offline",
        assignedArea: "Kalayaan Village",
        lastActive: "2 hours ago",
        email: "mark.s@trafficam.gov",
        profilePicture: Logo  
    },
    ];



    return (
        <div className='bg-white w-full h-full border-[1px] border-[#E2E8F0] px-6 py-6 rounded-lg'>
            <div className='flex items-center justify-between mb-[60px]'>
                
                <div className='relative flex items-center'>
                    <Search className="text-[#7E8998] absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name or badge..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-[350px] bg-[#F0F4F8] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ED6704] text-[14px] text-[#475569] pl-[50px] pr-5 py-2"
                    />

                    <button className="py-2 px-5 bg-[#ED6704] text-white rounded-lg ml-2 hover:bg-[#ED6704]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-2 text-[14px]">
                        <Funnel className="w-4 h-4 text-white" />
                        Filter
                    </button>

                </div>

                <button 
                 onClick={() => setIsModalOpen(!isModalOpen)}
                className="py-2 px-5 bg-[#0F2744] text-white rounded-lg ml-2 hover:bg-[#0F2744]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-4 text-[14px]">
                    <UserRoundPlus className="w-4 h-4 text-white" />
                    Add Enforcer
                </button>

                <EnrollmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(!isModalOpen)}
                />

            </div>
            <Table columns={columns} data={data} />
        </div>
    )
}