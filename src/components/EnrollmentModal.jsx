import { useState, useEffect } from "react";
import { User, Mail, Phone, Cpu, MapPin, HeartPulse, Camera } from "lucide-react";
import { Button } from "./ui/button";

const emptyFormState = {
    firstName: "",
    middleName: "",
    lastName: "",
    rank: "",
    badgeNumber: "",
    email: "",
    phone: "",
    deviceCode: "",
    homeStation: "",
    areaAssignment: "",
    birthdate: "",
    avatarPath: "",
    avatarFile: null,
    avatarPreview: "",
};

export default function EnrollmentModal({
    isOpen,
    onClose,
    action = "enroll",
    initialData = null,
    handleSubmit,
    isSaving = false,
}) {
    const [formData, setFormData] = useState(emptyFormState);
    const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

    // Populate form data if in "edit" mode, or reset if in "enroll" mode
    useEffect(() => {
        if (action === "edit" && initialData) {
            // Set the form data, and if there's an avatarPath, set it as preview too
            const formDataWithPreview = {
                ...initialData,
                avatarPreview: initialData.avatarPreview || initialData.profilePicture || initialData.avatarPath || ""
            };
            setFormData(formDataWithPreview);
        } else {
            setFormData(emptyFormState);
        }
    }, [action, initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        // Handle file inputs separately
        if (type === 'file') {
            const file = e.target.files[0];
            setFormData((prev) => ({
                ...prev,
                [name]: file,
            }));
            // Create preview URL for image files
            if (file) {
                const previewUrl = URL.createObjectURL(file);
                setFormData((prev) => ({
                    ...prev,
                    avatarPreview: previewUrl,
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type - only PNG and JPG allowed
            const allowedTypes = ['image/png', 'image/jpeg'];
            const allowedExtensions = ['.png', '.jpg', '.jpeg'];
            const fileExtension = file.name.toLowerCase().slice(-4);

            const isValidType = allowedTypes.includes(file.type) ||
                              allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

            if (!isValidType) {
                alert("Please upload a PNG or JPG image file only.");
                e.target.value = '';
                return;
            }

            setFormData((prev) => ({
                ...prev,
                avatarFile: file,
                avatarPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (isSaving) return;

        const deviceCode = (formData.deviceCode || "").trim();

        if (!/^[0-9]{4}$/.test(deviceCode)) {
            alert("Please enter exactly 4 digits for the device code.");
            return;
        }

        const formDataToSubmit = {
            ...formData,
            deviceCode,
        };

        delete formDataToSubmit.avatarPreview;

        await handleSubmit(formDataToSubmit, action);
    };

    if (!isOpen) return null;

    const isEnrollMode = action === "enroll";
    const modalTitle = isEnrollMode ? "Enroll New Enforcer" : "Edit Enforcer Profile";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
            {/* Modal Container - mimicking Dialog shell structure */}
            <div className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white rounded-lg border border-slate-100 shadow-2xl">
                {/* Header - mimicking DialogHeader */}
                <div className="px-6 pt-6 pb-2 shrink-0">
                    <h2 className="text-xl font-semibold text-slate-900">{modalTitle}</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {isEnrollMode
                            ? "Create a new enforcer record with profile, deployment, and emergency contact details."
                            : "Update the enforcer profile, device assignment, and emergency contact information."}
                    </p>
                </div>

                <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
                    {/* Scrollable Content Area */}
                    <div className="profile-modal-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-2">
                    {/* Centered Profile Photo Upload */}
                    <div className="mb-8">
                        <label
                            htmlFor="avatar-upload"
                            className="relative w-24 h-24 mx-auto rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer group"
                        >
                            {formData.avatarPreview || formData.avatarPath ? (
                                <img
                                    src={formData.avatarPreview || formData.avatarPath}
                                    alt="Enforcer Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Camera className="w-6 h-6 text-slate-400" />
                            )}
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-slate-900/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-4 h-4" />
                            </div>
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                        <p className="mt-2 text-xs text-slate-500 text-center">
                            {isEnrollMode
                                ? "Click the photo to upload. PNG and JPEG (Optional)"
                                : "Click the photo to upload or update. PNG and JPEG only"}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center">
                                <User className="w-4 h-4 mr-2" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Middle Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Middle Name</label>
                                    <input
                                        type="text"
                                        name="middleName"
                                        value={formData.middleName || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Last Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Birthdate */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Birthdate</label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Rank Designation */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Rank Designation</label>
                                    <select
                                        name="rank"
                                        value={formData.rank || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    >
                                        <option value="">Select designation</option>
                                        <option value="Sector Commander">Sector Commander</option>
                                        <option value="Deputized">Deputized</option>
                                        <option value="Non-deputized">Non-deputized</option>
                                        <option value="Volunteer">Volunteer</option>
                                    </select>
                                </div>
                                {/* Badge Number */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Badge Number</label>
                                    <input
                                        type="text"
                                        name="badgeNumber"
                                        value={formData.badgeNumber || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center">
                                <Mail className="w-4 h-4 mr-2" /> Contact Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Email Address */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Device Assignment */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center">
                                <Cpu className="w-4 h-4 mr-2" /> Device Assignment
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Device Code */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">
                                        Device Code
                                    </label>
                                    <input
                                        type="text"
                                        name="deviceCode"
                                        value={formData.deviceCode || ""}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/[^0-9]/g, "")
                                                .slice(0, 4);

                                            setFormData((prev) => ({
                                                ...prev,
                                                deviceCode: value,
                                            }));
                                        }}
                                        inputMode="numeric"
                                        maxLength={4}
                                        pattern="[0-9]{4}"
                                        title="Enter exactly 4 digits."
                                        placeholder="e.g. 0012"
                                        required
                                        disabled={isSaving}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Enter the code from the CAMote device assigned to this enforcer.
                                    </p>
                                </div>
                                {/* Home Station */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Home Station</label>
                                    <input
                                        type="text"
                                        name="homeStation"
                                        value={formData.homeStation || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Area of Assignment */}
                                <div className="space-y-2 col-span-2">
                                    <label className="block text-xs font-medium text-slate-600">Area of Assignment</label>
                                    <input
                                        type="text"
                                        name="areaAssignment"
                                        value={formData.areaAssignment || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center">
                                <HeartPulse className="w-4 h-4 mr-2" /> Emergency Contact
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Emergency Contact Name */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Full Name</label>
                                    <input
                                        type="text"
                                        name="emergencyContactName"
                                        value={formData.emergencyContactName || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Relationship */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Relationship</label>
                                    <input
                                        type="text"
                                        name="emergencyContactRelationship"
                                        value={formData.emergencyContactRelationship || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                                {/* Emergency Phone */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-medium text-slate-600">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="emergencyContactPhone"
                                        value={formData.emergencyContactPhone || ""}
                                        onChange={handleChange}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Footer */}
                        <div className="px-6 py-4 bg-white shrink-0 flex flex-row justify-between gap-3 sm:gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSaving}
                                className="min-w-[100px]"
                            >
                                Cancel
                            </Button>
                            {isEnrollMode ? (
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-[#0F2744] hover:bg-[#173A64] text-white min-w-[140px]"
                                >
                                    {isSaving ? "Saving..." : "Register Enforcer"}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-[#0F2744] hover:bg-[#173A64] text-white min-w-[140px]"
                                >
                                    {isSaving ? "Saving..." : "Update Enforcer"}
                                </Button>
                            )}
                        </div>
                </form>
            </div>
        </div>
    );
}