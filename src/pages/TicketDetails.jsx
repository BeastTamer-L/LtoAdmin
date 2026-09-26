import {ArrowLeft, Download, PrinterCheck, FileText} from "lucide-react";
import Accordion from "../components/Accordion";

export default function Ticket() {

    const ticketFields = [
    { label: "Enforcer", key: "enforcer" },
    { label: "License Number", key: "licenseNumber" },
    { label: "Plate Number", key: "plateNumber" },

    { label: "Driver / Offender", key: "driver" },
    { label: "License Status", key: "licenseStatus" },
    { label: "Date & Time", key: "dateTime" },

    { label: "Date of Birth", key: "dateOfBirth" },
    { label: "Violation", key: "violation" },
    { label: "Vehicle Type", key: "vehicleType" },
    ];
    const ticket = {
    ticketNo: "TKT-2026-00124",
    enforcer: "Arthur Nery (NCC-101)",
    licenseNumber: "N03-20-123456",
    plateNumber: "ABC123",
    fineAmount: "₱ 2500",
    driver: "Joseph Villa",
    licenseStatus: "Valid",
    dateTime: "2025-07-31 • 01:17 PM",
    gps: "14.74557 / 121.03487",
    dateOfBirth: "August 23, 2004",
    violation: "Beating the red light",
    vehicleType: "Motorcycle - Black",
    };


    return (
        <div className='w-full h-max'>
            <div className='flex items-center gap-3 mb-6'>
                <ArrowLeft className='w-8 h-5 text-[#3B82F6]' />
                <h1 className='text-md font-semibold text-[#3B82F6]'>Back</h1>
            </div>
            <div className='bg-white w-full h-max border-[1px] border-[#E2E8F0] rounded-lg'>
                <div className='flex items-center justify-between mb-4 w-full bg-[#0F2744] rounded-t-lg'>
                    <div className='flex flex-col items-start px-6 py-6'>
                        <h1 className='text-white text-[16px] font-semibold'><span className='text-[#e7600d]'>CAM</span><span className='text-[#243c56]'>OTE</span></h1>
                        <span className='text-white text-[14px]'>North Caloocan City Traffic Office - Complete Violation Case</span>
                    </div>
                    <h1 className='text-white text-[16px] font-semibold px-6 py-6'>{ticket.ticketNo}</h1>
                </div>
                {/*3v3 grid*/}
                <div className='grid grid-cols-3 gap-8 px-8 py-6 mb-4'>
                    {ticketFields.map((field) => (
                        <div key={field.key} className='flex flex-col'>
                            <span className='text-[14px] font-semibold text-[#8693A6] mb-2'>{field.label}</span>
                            <span className='text-[16px] font-semibold text-[#010101]'>{ticket[field.key]}</span>
                        </div>
                    ))}
                </div>
                {/*accordions*/}
                <div className="px-8 py-6 mb-4">
                    <div className="border-b border-[#8693A6]">
                        {/* Header */}
                        <div
                            className="flex w-full items-center justify-between py-5 text-left">
                            <span className="text-[16px] font-semibold text-[#010101]">
                                Violation Transcript
                            </span>
                            <button className="py-2 px-5 bg-[#ED6704] text-white rounded-lg ml-2 hover:bg-[#ED6704]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-2 text-[14px]">
                                <Download className="w-4 h-4 text-white" />
                                Dowload Transcript
                            </button>
                        </div>
                    </div>

                    <Accordion title="Captured Images">
                        <div className="grid grid-cols-3 gap-4">
                            <img
                                src="/images/violation-1.jpg"
                                className="w-full rounded-lg"
                                alt="Violation"
                            />
                            <img
                                src="/images/violation-2.jpg"
                                className="w-full rounded-lg"
                                alt="Vehicle"
                            />
                        </div>
                    </Accordion>

                    <Accordion title="Video Recording">
                        <video
                            controls
                            className="w-full rounded-lg"
                        >
                            <source src="/videos/violation.mp4" type="video/mp4" />
                        </video>
                    </Accordion>
            </div>
            <div className="px-8 py-6 flex items-center justify-end gap-2 mb-4">
                    <button className="py-2 px-5 bg-[#ED6704] text-white rounded-lg ml-2 hover:bg-[#ED6704]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-2 text-[14px] active:scale-[0.98]">
                                <PrinterCheck className="w-4 h-4 text-white" />
                                Print 
                    </button>
                    <button className="py-2 px-5 bg-[#0F2744] text-white rounded-lg ml-2 hover:bg-[#0F2744]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-2 text-[14px] active:scale-[0.98]">
                                <FileText className="w-4 h-4 text-white" />
                                Export PDF
                    </button>
            </div>        
        </div>

    </div>
    )
}