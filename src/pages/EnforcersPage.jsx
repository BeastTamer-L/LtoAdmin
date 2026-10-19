import { useEffect, useState, useCallback } from 'react'
import { Search, UserRoundPlus, SquarePen, UserX } from "lucide-react";
import Table from '../components/Table'
import Logo from '../assets/logo.png'
import EnrollmentModal from '../components/EnrollmentModal'
import Modal from '../components/Modal'
import { toast } from 'sonner';
import { createEmployeeInviteAndSendEmail, createProfileAccount } from '../lib/userInvites';
import { supabase } from '../supabaseClient';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';

const getProfilePhotoPath = (avatarPath) => {
    if (!avatarPath) return null;

    try {
        const photoUrl = new URL(avatarPath);
        const bucketPath = '/profile-photos/';
        const bucketPathIndex = photoUrl.pathname.indexOf(bucketPath);

        if (bucketPathIndex === -1) return null;
        return decodeURIComponent(photoUrl.pathname.slice(bucketPathIndex + bucketPath.length));
    } catch {
        return avatarPath;
    }
};

const positionLabels = {
    "sector commander": "Sector Commander",
    "Non-Deputized": "Traffic Enforcer I",
    Deputized: "Traffic Operations Officer",
    volunteere: "Volunteer",
};

export default function Enforcers() {
    const [search, setSearch] = useState('')
    const [positionFilter, setPositionFilter] = useState('');

    // Modal states
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

    // Action and target data state
    const [action, setAction] = useState("enroll"); // "enroll" or "edit"
    const [selectedEnforcer, setSelectedEnforcer] = useState(null);
    const [saving, setSaving] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);

    const loadProfiles = useCallback(async () => {
        setLoadingProfiles(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, middle_name, last_name, email, phone_number, badge_number, position, is_active, last_login_at, created_at, birthdate, avatar_path, device_code, buddy_id, area_of_assignment')
            .eq('role', 'enforcer')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error(`Failed to load enforcers: ${error.message}`);
        } else {
            // Create buddy map with firstName and lastName
            const buddyMap = new Map((data || []).map((profile) => [
                profile.id,
                {
                    firstName: profile.first_name || '',
                    lastName: profile.last_name || ''
                }
            ]));

            const profilesWithPhotoUrls = await Promise.all((data || []).map(async (profile) => {
                const photoPath = getProfilePhotoPath(profile.avatar_path);
                let buddyFormattedName = '';
                if (profile.buddy_id) {
                    const buddyInfo = buddyMap.get(profile.buddy_id);
                    if (buddyInfo) {
                        const firstName = buddyInfo.firstName;
                        if (firstName) {
                            const initials = firstName
                                .split(' ')
                                .filter(part => part.length > 0)
                                .map(part => part[0])
                                .join('');
                            if (initials && buddyInfo.lastName) {
                                buddyFormattedName = `${initials}. ${buddyInfo.lastName}`;
                            } else if (initials) {
                                buddyFormattedName = `${initials}.`;
                            } else {
                                buddyFormattedName = buddyInfo.lastName || '';
                            }
                        } else {
                            buddyFormattedName = buddyInfo.lastName || '';
                        }
                    }
                }
                if (!photoPath) return { ...profile, avatar_url: profile.avatar_path, buddyFormattedName };

                const { data: signedPhoto, error: photoError } = await supabase
                    .storage
                    .from('profile-photos')
                    .createSignedUrl(photoPath, 60 * 60);

                if (photoError) {
                    console.error('Profile photo URL error:', photoError);
                    return { ...profile, avatar_url: profile.avatar_path, buddyFormattedName };
                }

                return {
                    ...profile,
                    avatar_url: signedPhoto.signedUrl,
                    buddyFormattedName,
                };
            }));

            setProfiles(profilesWithPhotoUrls);
        }
        setLoadingProfiles(false);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            await loadProfiles();
        };
        loadData();
    }, [loadProfiles]);

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
            const deviceCode = (formData.deviceCode || "").trim();

            if (!/^[0-9]{4}$/.test(deviceCode)) {
                throw new Error("Please enter exactly 4 digits for the device code.");
            }

            let avatarPath = formData.avatarPath || null;
            let userId = formAction === "edit" ? selectedEnforcer.id : null;

            if (formAction !== "edit") {
                const profile = await createProfileAccount({
                    firstName: formData.firstName.trim(),
                    middleName: formData.middleName.trim() || null,
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phoneNumber: formData.phone.trim() || null,
                    badgeNumber: formData.badgeNumber.trim() || null,
                    position: formData.rank.trim() || null,
                    role: "enforcer",
                    birthdate: formData.birthdate || null,
                    deviceCode,
                    buddyId: formData.buddyId || null,
                });

                userId = profile.id;

                await createEmployeeInviteAndSendEmail({
                    userId: profile.id,
                    email: formData.email,
                    toName: `${formData.firstName} ${formData.lastName}`.trim(),
                    role: "enforcer",
                });
            }

            // Handle avatar upload if file is selected
            if (formData.avatarFile) {
                const fileExt = formData.avatarFile.name.split('.').pop();
                const fileName = `${crypto.randomUUID()}.${fileExt}`;

                const storagePath = `${userId}/${fileName}`;
                const { error: uploadError } = await supabase
                    .storage
                    .from('profile-photos')
                    .upload(storagePath, formData.avatarFile);

                if (uploadError) throw uploadError;

                avatarPath = storagePath;
            }

            if (formAction === "edit") {
                const profilePayload = {
                    first_name: formData.firstName.trim(),
                    middle_name: formData.middleName.trim() || null,
                    last_name: formData.lastName.trim(),
                    email: formData.email.trim().toLowerCase(),
                    phone_number: formData.phone.trim() || null,
                    badge_number: formData.badgeNumber.trim() || null,
                    position: formData.rank.trim() || null,
                    birthdate: formData.birthdate || null,
                    area_of_assignment: formData.areaAssignment.trim() || null,
                    avatar_path: avatarPath,
                    device_code: deviceCode,
                    buddy_id: formData.buddyId || null,
                };

                const { data: updatedProfile, error } = await supabase
                    .from('profiles')
                    .update(profilePayload)
                    .eq('id', selectedEnforcer.id)
                    .select('id')
                    .maybeSingle();

                if (error) throw error;
                if (!updatedProfile) {
                    throw new Error('Profile was not updated. Check the profiles table UPDATE policy.');
                }

                setIsEnrollModalOpen(false);
                await loadProfiles();
                toast.success("Enforcer personal information updated.");
                return;
            }

            if (avatarPath) {
                const { data: updatedProfile, error } = await supabase
                    .from('profiles')
                    .update({ avatar_path: avatarPath })
                    .eq('id', userId)
                    .select('id')
                    .maybeSingle();

                if (error) throw error;
                if (!updatedProfile) {
                    throw new Error('Profile photo was uploaded, but the profile was not updated. Check the profiles table UPDATE policy.');
                }
            }

            setIsEnrollModalOpen(false);
            await loadProfiles();
            toast.success("Enforcer account created and activation email sent.");
        } catch (error) {
            const message =
                error.code === "23505" &&
                `${error.message || ""} ${error.details || ""}`
                    .includes("profiles_device_code_unique")
                    ? "This device code is already assigned to another enforcer."
                    : error.message || "Unable to save the enforcer account.";

            toast.error(message);
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
                    </div>
                </div>
            )
        },
        {
            key: "rank",
            label: "Position",
            render: (row) => positionLabels[row.rank] || '—',
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
            label: "Sector",
        },
        {
            key: "buddyFormattedName",
            label: "Buddy",
            render: (row) => (
                <span className="font-bold">
                    {row.buddyFormattedName || '—'}
                </span>
            ),
        },
        {
            key: "deviceCode",
            label: "Device ID",
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
            const matchesSearch = !query || `${name} ${profile.email || ''} ${profile.badge_number || ''}`.toLowerCase().includes(query);

            const matchesPosition = !positionFilter || profile.position === positionFilter;

            return matchesSearch && matchesPosition;
        })
        .map((profile) => ({
            id: profile.id,
            firstName: profile.first_name || '',
            middleName: profile.middle_name || '',
            lastName: profile.last_name || '',
            rank: profile.position || '',
            badgeNumber: profile.badge_number || '',
            phone: profile.phone_number || '',
            deviceCode: profile.device_code || '',
            homeStation: '',
            areaAssignment: profile.area_of_assignment || '',
            assignedArea: profile.area_of_assignment || '',
            enforcer: (() => {
                const firstName = profile.first_name || '';
                const initials = firstName
                    .split(' ')
                    .filter(part => part.length > 0)
                    .map(part => part[0])
                    .join('');
                if (initials && profile.last_name) {
                    return `${initials}. ${profile.last_name}`;
                }
                return `${profile.first_name} ${profile.middle_name || ''} ${profile.last_name || ''}`.trim();
            })(),
            badgeNo: profile.badge_number || '—',
            status: profile.is_active ? 'Active' : 'Inactive',
            lastActive: profile.last_login_at ? new Date(profile.last_login_at).toLocaleString() : 'Never',
            email: profile.email,
            profilePicture: profile.avatar_url || Logo,
            birthdate: profile.birthdate,
            avatarPath: profile.avatar_path,
            buddyId: profile.buddy_id || "",
            buddyFormattedName: profile.buddyFormattedName || '—',
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

                    <Select
                        value={positionFilter || "all"}
                        onValueChange={(value) => setPositionFilter(value === "all" ? "" : value)}
                    >
                        <SelectTrigger className="enforcers-select-trigger ml-2 h-[38px] w-full rounded-lg px-3 py-2 text-[14px] shadow-none ring-offset-white sm:w-[180px]">
                            <SelectValue placeholder="All Positions" />
                        </SelectTrigger>
                        <SelectContent className="enforcers-select-options select-slide-down bg-white">
                            <SelectItem value="all">All Positions</SelectItem>
                            <SelectItem value="sector commander">Sector Commander</SelectItem>
                            <SelectItem value="Non-Deputized">Traffic Enforcer I</SelectItem>
                            <SelectItem value="Deputized">Traffic Operations Officer</SelectItem>
                            <SelectItem value="volunteere">Volunteer</SelectItem>
                        </SelectContent>
                    </Select>
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
                availableEnforcers={profiles}
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