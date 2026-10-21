import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from "react-dom";
import {
    Search,
    UserRoundPlus,
    EllipsisVertical,
    MapPin,
    ArrowLeft,
} from "lucide-react";
import { useNavigate } from 'react-router-dom'
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

const featuredSectors = [
    "Vicas Sector",
    "Deparo Sector",
    "Malaria Sector",
    "Maligaya Sector",
    "General luis Sector",
    "almar Sector",
    "llano Sector",
];

const formatEnforcerName = (enforcer) => {
    const firstName = enforcer.first_name || "";
    const initials = firstName
        .split(" ")
        .filter((part) => part.length > 0)
        .map((part) => part[0])
        .join("");

    if (initials && enforcer.last_name) {
        return `${initials}. ${enforcer.last_name}`;
    }

    return `${firstName} ${enforcer.middle_name || ""} ${
        enforcer.last_name || ""
    }`.trim() || "Enforcer";
};

export default function Enforcers() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('')
    const [positionFilter, setPositionFilter] = useState('');

    // Modal states
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [actionMenu, setActionMenu] = useState(null);
    const actionMenuRef = useRef(null);
    const actionButtonRef = useRef(null);

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

    const handleCompanionMap = () => {
        navigate("/enforcers/companion-map");
    };

    useEffect(() => {
        if (!actionMenu) return undefined;

        const closeMenuOnOutsideClick = (event) => {
            if (
                !actionMenuRef.current?.contains(event.target) &&
                !actionButtonRef.current?.contains(event.target)
            ) {
                setActionMenu(null);
            }
        };
        const closeMenuOnEscape = (event) => {
            if (event.key === "Escape") setActionMenu(null);
        };

        document.addEventListener("pointerdown", closeMenuOnOutsideClick);
        document.addEventListener("keydown", closeMenuOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
            document.removeEventListener("keydown", closeMenuOnEscape);
        };
    }, [actionMenu]);

    const openActionMenu = (event, row) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const menuWidth = 190;
        setActionMenu({
            row,
            top: Math.min(bounds.bottom + 4, window.innerHeight - 124),
            left: Math.max(8, bounds.right - menuWidth),
        });
        actionButtonRef.current = event.currentTarget;
    };

    const confirmDeactivate = async () => {
        if (!selectedEnforcer) return;

        try {
            const { data, error } = await supabase
                .from("profiles")
                .update({ is_active: false })
                .eq("id", selectedEnforcer.id)
                .select("id")
                .maybeSingle();

            if (error) {
                toast.error(`Failed to deactivate enforcer: ${error.message}`);
                return;
            }
            if (!data) {
                toast.error("Enforcer was not deactivated. Check the profiles table UPDATE policy.");
                return;
            }

            setIsDeactivateModalOpen(false);
            setSelectedEnforcer(null);
            await loadProfiles();
            toast.success("Enforcer deactivated.");
        } catch (error) {
            toast.error(`Failed to deactivate enforcer: ${error.message || "Unexpected error."}`);
        }
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
            key: "battery",
            label: "Battery",
            render: () => (
                <span className="font-semibold text-green-500">80%</span>
            ),
        },
        {
            key: "actions",
            label: "More",
            render: (row) => (
                <div>
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (actionMenu?.row.id === row.id) {
                                setActionMenu(null);
                            } else {
                                openActionMenu(event, row);
                            }
                        }}
                        className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                        aria-label={`More actions for ${row.enforcer}`}
                        aria-haspopup="menu"
                        aria-expanded={actionMenu?.row.id === row.id}
                    >
                        <EllipsisVertical size={18} />
                    </button>
                    {actionMenu?.row.id === row.id &&
                        createPortal(
                            <div
                                ref={actionMenuRef}
                                role="menu"
                                className="fixed z-[100] w-[190px] rounded-md bg-[#102D4A] py-1 text-white shadow-lg"
                                style={{
                                    top: actionMenu.top,
                                    left: actionMenu.left,
                                }}
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setActionMenu(null);
                                        handleEdit(row);
                                    }}
                                    className="block w-full px-3 py-2 text-left text-xs hover:bg-white/10"
                                >
                                    Edit Enforcer Profile
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setActionMenu(null);
                                        handleDeactivate(row);
                                    }}
                                    className="block w-full border-t border-white/20 px-3 py-2 text-left text-xs hover:bg-white/10"
                                >
                                    Deactivate Enforcer
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setActionMenu(null);
                                        toast.info("Delete Enforcer is not available yet.");
                                    }}
                                    className="block w-full border-t border-white/20 px-3 py-2 text-left text-xs hover:bg-white/10"
                                >
                                    Delete Enforcer
                                </button>
                            </div>,
                            document.body
                        )}
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

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCompanionMap}
                        className="py-2 px-5 bg-[#0F2744] text-white rounded-lg cursor-pointer hover:bg-[#0F2744]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-4 text-[14px]"
                    >
                        <MapPin className="w-4 h-4 text-white" />
                        Companion Map
                    </button>
                    <button
                        onClick={handleOpenEnroll}
                        className="py-2 px-5 bg-[#0F2744] text-white rounded-lg cursor-pointer hover:bg-[#0F2744]/80 transition duration-300 ease-in-out flex items-center font-semibold gap-4 text-[14px]"
                    >
                        <UserRoundPlus className="w-4 h-4 text-white" />
                        Enroll Enforcer
                    </button>
                </div>

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
                color="#CC2B2B"
            />
        </div>
    )
}

export function CompanionMap() {
    const navigate = useNavigate();
    const [enforcers, setEnforcers] = useState([]);
    const [selectedSector, setSelectedSector] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEnforcers = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select(
                    "id, first_name, middle_name, last_name, position, area_of_assignment, avatar_path"
                )
                .eq("role", "enforcer")
                .eq("is_active", true)
                .order("first_name");

            if (error) {
                toast.error(`Failed to load enforcers: ${error.message}`);
            } else {
                const profilesWithPhotos = await Promise.all(
                    (data || []).map(async (enforcer) => {
                        const photoPath = getProfilePhotoPath(enforcer.avatar_path);
                        if (!photoPath) {
                            return {
                                ...enforcer,
                                avatar_url: enforcer.avatar_path || Logo,
                            };
                        }

                        const { data: signedPhoto, error: photoError } = await supabase
                            .storage
                            .from("profile-photos")
                            .createSignedUrl(photoPath, 60 * 60);

                        if (photoError) {
                            console.error("Profile photo URL error:", photoError);
                            return {
                                ...enforcer,
                                avatar_url: enforcer.avatar_path || Logo,
                            };
                        }

                        return { ...enforcer, avatar_url: signedPhoto.signedUrl };
                    })
                );

                setEnforcers(profilesWithPhotos);
            }
            setLoading(false);
        };

        loadEnforcers();
    }, []);

    const sectors = [
        ...new Set([
            ...featuredSectors,
            ...enforcers
                .map((enforcer) => enforcer.area_of_assignment)
                .filter(Boolean),
        ]),
    ];
    const filteredEnforcers = selectedSector
        ? enforcers.filter(
            (enforcer) => enforcer.area_of_assignment === selectedSector
        )
        : enforcers;

    return (
        <main className="flex h-full min-h-0 flex-col bg-[#F0F4F8] text-slate-800">
            <section className="relative min-h-[220px] flex-[3] border-b border-slate-200 bg-slate-100">
                <button
                    type="button"
                    onClick={() => navigate("/enforcers")}
                    className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                    <ArrowLeft size={16} />
                    Back to Enforcer List
                </button>
            </section>

            <section className="min-h-0 flex-[2] overflow-auto bg-[#F0F4F8] px-5 py-4 md:px-6">
                <div className="flex min-h-[56px] items-center justify-between gap-4 border-b border-slate-300 pb-3">
                    <div className="shrink-0">
                        <h2 className="text-base font-semibold">Navigate by Sector</h2>
                        <p className="text-[10px] uppercase leading-none tracking-wide text-slate-500">
                            Commander View
                        </p>
                    </div>
                    <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 sm:justify-start">
                        {sectors.map((sector) => (
                            <button
                                key={sector}
                                type="button"
                                onClick={() =>
                                    setSelectedSector((current) =>
                                        current === sector ? null : sector
                                    )
                                }
                                aria-pressed={selectedSector === sector}
                                className={`shrink-0 rounded-md border px-3 py-2 text-xs transition ${
                                    selectedSector === sector
                                        ? "border-[#102D4A] bg-[#102D4A] text-white"
                                        : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                                }`}
                            >
                                {sector}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-4">
                    <div className="mb-3">
                        <h2 className="text-base font-semibold">Traffic Enforcers</h2>
                        <p className="text-xs text-slate-500">
                            {loading
                                ? "Loading enforcers..."
                                : `${filteredEnforcers.length} ${
                                    filteredEnforcers.length === 1
                                        ? "enforcer"
                                        : "enforcers"
                                }`}
                        </p>
                    </div>

                    {loading ? (
                        <p className="py-6 text-sm text-slate-500">
                            Loading enforcers...
                        </p>
                    ) : filteredEnforcers.length === 0 ? (
                        <p className="py-6 text-sm text-slate-500">
                            No active enforcers found for this sector.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {filteredEnforcers.map((enforcer) => (
                                <article
                                    key={enforcer.id}
                                    className="flex min-w-0 items-center gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm"
                                >
                                    <img
                                        src={enforcer.avatar_url}
                                        alt={formatEnforcerName(enforcer)}
                                        className="h-10 w-10 shrink-0 rounded-full bg-green-100 object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {formatEnforcerName(enforcer)}
                                        </p>
                                        <p className="truncate text-xs font-medium text-green-700">
                                            {positionLabels[enforcer.position] ||
                                                enforcer.position ||
                                                "Traffic Enforcer"}
                                        </p>
                                        <p className="truncate text-xs text-slate-500">
                                            {enforcer.area_of_assignment || "Unassigned sector"}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
