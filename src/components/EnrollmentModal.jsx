import { useState } from "react";
import { X } from "lucide-react";

export default function EnrollEnforcerModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        rank: "",
        badgeNumber: "",
        email: "",
        phone: "",
        iotDeviceId: "",
        homeStation: "",
        areaAssignment: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log(formData);

        // Submit to your backend/Firebase here
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

            {/* Modal */}
            <div className="relative w-full max-w-[550px] max-h-[95vh] overflow-y-auto border-2 border-[#E2E8F0] bg-white px-5 py-5 shadow-2xl rounded-lg">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-3 text-[#8693A6] transition hover:text-[#4F6AD8]"
                >
                    <X size={30} strokeWidth={3} />
                </button>

                {/* Header */}
                <div className="pr-10">
                    <h2 className="text-[16px] font-medium text-[#010101] font-semibold">
                        Enroll New Enforcer
                    </h2>

                    <p className="mt-0.5 text-[9px] text-[#8693A6]">
                        Register a new traffic enforcer and assign a TraffiCam body-worn camera device.
                    </p>
                </div>

                <div className="my-5 h-px bg-[#E2E7ED]" />

                <form onSubmit={handleSubmit}>

                    {/* PERSONAL INFORMATION */}
                    <SectionTitle title="PERSONAL INFORMATION" />

                    <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                        <Input
                            label="First Name"
                            required
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                        />

                        <Input
                            label="Last Name"
                            required
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                        />

                        <Input
                            label="Rank Designation"
                            required
                            name="rank"
                            placeholder="e.g. Senior Traffic Enforcer"
                            value={formData.rank}
                            onChange={handleChange}
                        />

                        <Input
                            label="Badge Number"
                            required
                            name="badgeNumber"
                            value={formData.badgeNumber}
                            onChange={handleChange}
                        />
                    </div>

                    <Divider />

                    {/* CONTACT DETAILS */}
                    <SectionTitle title="CONTACT DETAILS" />

                    <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                        <Input
                            label="Email Address"
                            required
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />

                        <Input
                            label="Phone number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>

                    <Divider />

                    {/* DEVICE ASSIGNMENT */}
                    <SectionTitle title="DEVICE ASSIGNMENT" />

                    <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                        <Input
                            label="IoT Device ID"
                            required
                            name="iotDeviceId"
                            value={formData.iotDeviceId}
                            onChange={handleChange}
                        />

                        <Input
                            label="Home Station"
                            required
                            name="homeStation"
                            value={formData.homeStation}
                            onChange={handleChange}
                        />

                        <div className="col-span-2">
                            <Input
                                label="Area of Assignment"
                                required
                                name="areaAssignment"
                                value={formData.areaAssignment}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="mt-16 flex items-center justify-between">

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="rounded-[4px] bg-[#0F2744] px-6 py-3 text-[11px] font-medium text-white transition hover:bg-[#173A64] active:scale-[0.98]"
                            >
                                Enroll Enforcer
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setFormData({
                                        firstName: "",
                                        lastName: "",
                                        rank: "",
                                        badgeNumber: "",
                                        email: "",
                                        phone: "",
                                        iotDeviceId: "",
                                        homeStation: "",
                                        areaAssignment: "",
                                    })
                                }
                                className="rounded-[4px] bg-[#EDF1F5] px-6 py-3 text-[11px] font-medium text-[#202020] transition hover:bg-[#E0E5EA] active:scale-[0.98]"
                            >
                                Reset
                            </button>
                        </div>

                        <span className="text-[9px] text-[#8693A6]">
                            <span className="text-red-500">*</span>{" "}
                            required fields
                        </span>

                    </div>

                </form>
            </div>
        </div>
    );
}


/* ---------------- Components ---------------- */

function SectionTitle({ title }) {
    return (
        <h3 className="mb-4 text-[12px] font-medium text-[#202020]">
            {title}
        </h3>
    );
}

function Divider() {
    return (
        <div className="my-6 h-px bg-[#E2E7ED]" />
    );
}

function Input({
    label,
    required = false,
    type = "text",
    placeholder = "",
    name,
    value,
    onChange,
}) {
    return (
        <div>
            <label className="mb-1 block text-[10px] font-medium text-[#202020]">
                {label}{" "}
                {required && (
                    <span className="text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="h-[30px] w-full rounded-[5px] border border-[#DCE3EB] bg-[#EFF3F7] px-3 text-[10px] text-[#202020] outline-none transition placeholder:text-[#9AA9BA] focus:border-[#4F6AD8] focus:ring-1 focus:ring-[#4F6AD8]/20"
            />
        </div>
    );
}