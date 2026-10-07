import { useState, useEffect } from "react";
import { X } from "lucide-react";

const emptyFormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    rank: "",
    badgeNumber: "",
    email: "",
    phone: "",
    iotDeviceId: "",
    homeStation: "",
    areaAssignment: "",
};

export default function EnrollEnforcerModal({ 
    isOpen, 
    onClose, 
    action = "enroll", 
    initialData = null, 
    handleSubmit,
    isSaving = false,
}) {
    const [formData, setFormData] = useState(emptyFormState);

    // Populate form data if in "edit" mode, or reset if in "enroll" mode
    useEffect(() => {
        if (action === "edit" && initialData) {
            setFormData(initialData);
        } else {
            setFormData(emptyFormState);
        }
    }, [action, initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(formData, action);
    };

    if (!isOpen) return null;

    const isEnrollMode = action === "enroll";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            {/* Modal Container */}
            <div className="relative w-full max-w-[550px] max-h-[95vh] overflow-y-auto border-2 border-[#E2E8F0] bg-white px-5 py-5 shadow-2xl rounded-lg">
                
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-3 text-[#8693A6] transition hover:text-[#0F2744]"
                >
                    <X size={26} strokeWidth={2.5} />
                </button>

                {/* Dynamic Header */}
                <div className="pr-10">
                    {
                        action == "enroll" ? (
                           <div>
                                <h2 className="text-[16px] font-semibold text-[#010101]">
                                    Enroll New Enforcer
                                </h2>
                                <p className="mt-0.5 text-[11px] text-[#8693A6]">
                                    Register a new traffic enforcer and assign a CAMOTE body-worn camera device.
                                </p>
                           </div>
                        ) : (
                            <div className="w-[80px] h-[80px] rounded-full bg-[#010101]">

                            </div>
                        )
                    }



                </div>

                <Divider />

                <form onSubmit={handleFormSubmit}>
                    {/* PERSONAL INFORMATION */}
                    <SectionTitle title="PERSONAL INFORMATION" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                        <Input label="First Name" required name="firstName" value={formData.firstName} onChange={handleChange} />
                        <Input label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} />
                        <Input label="Last Name" required name="lastName" value={formData.lastName} onChange={handleChange} />
                        <SelectInput
                            label="Rank Designation"
                            required
                            name="rank"
                            value={formData.rank}
                            onChange={handleChange}
                            options={["Sector Commander", "Deputized", "Non-deputized", "Volunteer"]}
                        />
                        <Input label="Badge Number" required name="badgeNumber" value={formData.badgeNumber} onChange={handleChange} />
                    </div>

                    <Divider />

                    {/* CONTACT DETAILS */}
                    <SectionTitle title="CONTACT DETAILS" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                        <Input label="Email Address" required type="email" name="email" value={formData.email} onChange={handleChange} />
                        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>

                    <Divider />

                    {/* DEVICE ASSIGNMENT */}
                    <SectionTitle title="DEVICE ASSIGNMENT" />
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                        <Input label="IoT Device ID" required={isEnrollMode} name="iotDeviceId" value={formData.iotDeviceId} onChange={handleChange} />
                        <Input label="Home Station" required={isEnrollMode} name="homeStation" value={formData.homeStation} onChange={handleChange} />
                        <div className="col-span-2">
                            <Input label="Area of Assignment" required={isEnrollMode} name="areaAssignment" value={formData.areaAssignment} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Modal Footer Controls */}
                    <div className="mt-10 flex items-center justify-between">
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="rounded-[4px] bg-[#0F2744] px-6 py-2.5 text-[12px] font-medium text-white transition hover:bg-[#173A64] active:scale-[0.98]"
                            >
                                {isSaving ? "Sending Invitation..." : isEnrollMode ? "Enroll Enforcer" : "Save Changes"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData(isEnrollMode ? emptyFormState : initialData)}
                                className="rounded-[4px] bg-[#EDF1F5] px-6 py-2.5 text-[12px] font-medium text-[#202020] transition hover:bg-[#E0E5EA] active:scale-[0.98]"
                            >
                                {isEnrollMode ? "Reset" : "Revert"}
                            </button>
                        </div>

                        <span className="text-[10px] text-[#8693A6]">
                            <span className="text-red-500">*</span> required fields
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ---------------- Helper Sub-Components ---------------- */

function SectionTitle({ title }) {
    return <h3 className="mb-3 text-[11px] font-bold text-[#202020] tracking-wider">{title}</h3>;
}

function Divider() {
    return <div className="my-5 h-px bg-[#E2E7ED]" />;
}

function Input({ label, required = false, type = "text", placeholder = "", name, value, onChange }) {
    return (
        <div>
            <label className="mb-1 block text-[11px] font-medium text-[#202020]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                name={name}
                value={value || ""}
                onChange={onChange}
                placeholder={placeholder}
                className="h-[34px] w-full rounded-[4px] border border-[#DCE3EB] bg-[#EFF3F7] px-3 text-[12px] text-[#202020] outline-none transition placeholder:text-[#9AA9BA] focus:border-[#0F2744] focus:ring-1 focus:ring-[#0F2744]/20"
            />
        </div>
    );
}

function SelectInput({ label, required = false, name, value, onChange, options }) {
    return (
        <div>
            <label className="mb-1 block text-[11px] font-medium text-[#202020]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                required={required}
                name={name}
                value={value || ""}
                onChange={onChange}
                className="h-[34px] w-full rounded-[4px] border border-[#DCE3EB] bg-[#EFF3F7] px-3 text-[12px] text-[#202020] outline-none transition focus:border-[#0F2744] focus:ring-1 focus:ring-[#0F2744]/20"
            >
                <option value="" disabled>Select designation</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}