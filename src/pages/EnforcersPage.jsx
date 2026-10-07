import { useEffect, useState } from 'react'
import { Search, Funnel, UserRoundPlus, SquarePen, UserX } from "lucide-react";
import Table from '../components/Table'
import Logo from '../assets/logo.png'
import EnrollmentModal from '../components/EnrollmentModal'
import Modal from '../components/Modal'
import { toast } from 'sonner';
import { createEmployeeInviteAndSendEmail, createProfileAccount } from '../lib/userInvites';
import { supabase } from '../supabaseClient';

export default function Enforcers() {
    const [search, setSearch] = useState('')
    
    // Modal states
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    
    // Action and target data state
    const [action, setAction] = useState("enroll"); // "enroll" or "edit"
    const [selectedEnforcer, setSelectedEnforcer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    const loadProfiles = async () => {
        setLoadingProfiles(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, middle_name, last_name, email, phone_number, badge_number, position, is_active, last_login_at, created_at')
            .eq('role', 'enforcer')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error(`Failed to load enforcers: ${error.message}`);
        } else {
            setProfiles(data || []);
        }
        setLoadingProfiles(false);
    };

    useEffect(() => {
        loadProfiles();
    }, []);

    // Handlers
    const handleOpenEnroll = () => {
        setAction("enroll");
        setSelectedEnforcer(null);
        setIsEnrollModalOpen(true);
    };

    const handleEdit = (row) => {
        setAction("edit");
        setSelectedEnforcer(row);
        setIsEnrollModalOpen(true);
    };

    const handleDeactivate = (row) => {
        setSelectedEnforcer(row);
        setIsDeactivateModalOpen(true);
    };

    const confirmDeactivate = () => {
        console.log("Deactivating enforcer:", selectedEnforcer);
        // Insert API call to deactivate here
        setIsDeactivateModalOpen(false);
    };

    const handleSubmit = async (formData, formAction) => {
        setSaving(true);
        try {
            const profilePayload = {
                first_name: formData.firstName.trim(),
                middle_name: formData.middleName.trim() || null,
                last_name: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                phone_number: formData.phone.trim() || null,
                badge_number: formData.badgeNumber.trim() || null,
                position: formData.rank.trim() || null,
            };

            if (formAction === "edit") {
                const { error } = await supabase
                    .from('profiles')
                    .update(profilePayload)
                    .eq('id', selectedEnforcer.id);

                if (error) throw error;

                setIsEnrollModalOpen(false);
                await loadProfiles();
                toast.success("Enforcer personal information updated.");
                return;
            }

            const profile = await createProfileAccount({
                firstName: profilePayload.first_name,
                middleName: profilePayload.middle_name,
                lastName: profilePayload.last_name,
                email: profilePayload.email,
                phoneNumber: profilePayload.phone_number,
                badgeNumber: profilePayload.badge_number,
                position: profilePayload.position,
                role: "enforcer",
            });

            await createEmployeeInviteAndSendEmail({
                userId: profile.id,
                email: formData.email,
                toName: `${formData.firstName} ${formData.lastName}`.trim(),
                role: "enforcer",
            });

            setIsEnrollModalOpen(false);
            await loadProfiles();
            toast.success("Enforcer account created and activation email sent.");
        } catch (error) {
            toast.error(error.message || "Unable to create the enforcer account.");
        } finally {
            setSaving(false);
        }
    };

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
                        <span className="font-semibold text-black block">
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
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleEdit(row)}
                        className="flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
                        title="Edit Enforcer"
                    >
                        <SquarePen className="w-3.5 h-3.5 text-slate-600" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleDeactivate(row)}
                        className="flex items-center gap-2 rounded-md bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                        title="Deactivate Enforcer"
                    >
                        <UserX className="w-3.5 h-3.5 text-red-600" />
                        Deactivate
                    </button>
                </div>
            )
        }
    ];

    const data = profiles
        .filter((profile) => {
            const query = search.trim().toLowerCase();
            const name = `${profile.first_name || ''} ${profile.middle_name || ''} ${profile.last_name || ''}`;
            return !query || `${name} ${profile.email || ''} ${profile.badge_number || ''}`.toLowerCase().includes(query);
        })
        .map((profile) => ({
            id: profile.id,
            firstName: profile.first_name || '',
            middleName: profile.middle_name || '',
            lastName: profile.last_name || '',
            rank: profile.position || '',
            badgeNumber: profile.badge_number || '',
            phone: profile.phone_number || '',
            iotDeviceId: '',
            homeStation: '',
            areaAssignment: '',
            enforcer: `${profile.first_name} ${profile.middle_name ? `${profile.middle_name} ` : ''}${profile.last_name}`,
            badgeNo: profile.badge_number || '—',
            status: profile.is_active ? 'Active' : 'Inactive',
            assignedArea: '—',
            lastActive: profile.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Never',
            email: profile.email,
            profilePicture: Logo,
        }));

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
                    onClick={handleOpenEnroll}
                    className="py-2 px-5 bg-[#0F2744] text-white rounded-lg ml-2 hover:bg-[#0F2744]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-4 text-[14px]"
                >
                    <UserRoundPlus className="w-4 h-4 text-white" />
                    Add Enforcer
                </button>

            </div>

            {loadingProfiles ? (
                <div className="py-12 text-center text-sm text-[#8693A6]">Loading registered enforcers...</div>
            ) : (
                <Table columns={columns} data={data} />
            )}

            {/* Enroll / Edit Modal */}
            <EnrollmentModal
                isOpen={isEnrollModalOpen}
                onClose={() => setIsEnrollModalOpen(false)}
                action={action}
                initialData={selectedEnforcer}
                handleSubmit={handleSubmit}
                isSaving={saving}
            />

            {/* Deactivation Confirmation Modal */}
            <Modal 
                isOpen={isDeactivateModalOpen}
                onClose={() => setIsDeactivateModalOpen(false)}
                title={`Deactivate ${selectedEnforcer?.enforcer || "Enforcer"}?`}
                description={`This will prevent ${selectedEnforcer?.enforcer || "the enforcer"} (${selectedEnforcer?.badgeNo || ""}) from accessing the CAMOTE system. You can reactivate the account at any time.`}
                onConfirm={confirmDeactivate}
                confirmText="Deactivate"
                cancelText="Cancel"
                color = "#CC2B2B"
            />
        </div>
    )
}