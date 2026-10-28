
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CarFront,
  UserRound,
  PlayCircle,
  MapPin,
  MoreVertical,
  Plus,
} from "lucide-react";
import SearchInput from "../components/SearchInput";
import FilterSelect from "../components/FilterSelect";
import DatePicker from "../components/DatePicker";
import LicenseModal from "../components/LicenseModal";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import { toDriver, toVehicle, toReceipt, loadCitationHistory } from "../lib/licenseRecords";


export default function LicenseDatabase() {
  // Initially show the table, not the profile.
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Citation History");
  const [selectedCitationId, setSelectedCitationId] = useState(null);
  const [citations, setCitations] = useState([]);
  const [citationsLoading, setCitationsLoading] = useState(false);

  // Citation history: the tickets filed in the app with this driver's license number
  const selectedLicenseNumber = selectedDriver?.licenseNumber;
  useEffect(() => {
    if (!selectedLicenseNumber) return undefined;
    let cancelled = false;
    loadCitationHistory(selectedLicenseNumber)
      .then((records) => {
        if (!cancelled) setCitations(records);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load the citation history:", error);
        toast.error(`Failed to load the citation history: ${error.message}`);
        setCitations([]);
      })
      .finally(() => {
        if (!cancelled) setCitationsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedLicenseNumber]);

  useEffect(() => {
    let cancelled = false;

    const loadLicenses = async () => {
      const [licensesResult, vehiclesResult, receiptsResult] = await Promise.all([
        supabase.from("driver_licenses").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("registered_vehicles").select("*").not("owner_license_number", "is", null).limit(1000),
        supabase.from("vehicle_official_receipts").select("*").order("valid_until", { ascending: false }).limit(2000),
      ]);

      if (cancelled) return;

      if (licensesResult.error) {
        console.error("Failed to load licenses:", licensesResult.error);
        toast.error(`Failed to load licenses: ${licensesResult.error.message}`);
      } else {
        setDrivers((licensesResult.data || []).map(toDriver));
      }

      // The licenses still show if the vehicles fail to load
      const vehiclesFailure = vehiclesResult.error || receiptsResult.error;
      if (vehiclesFailure) {
        console.error("Failed to load registered vehicles:", vehiclesFailure);
        toast.error(`Failed to load registered vehicles: ${vehiclesFailure.message}`);
      } else {
        setVehicles((vehiclesResult.data || []).map(toVehicle));
        setReceipts((receiptsResult.data || []).map(toReceipt));
      }
      setLoading(false);
    };

    loadLicenses();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      `${driver.fullName} ${driver.licenseNumber} ${driver.dateOfBirth}`
        .toLowerCase()
        .includes(tableSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && /active/i.test(driver.status)) ||
      (statusFilter === "Expired" && /expired/i.test(driver.status)) ||
      (statusFilter === "Suspended" && /suspended/i.test(driver.status)) ||
      (statusFilter === "Revoked" && /revoked/i.test(driver.status));
    const matchesExpiry =
      !expiryFilter || formatExpiryDate(driver.expiration) === expiryFilter;

    return matchesSearch && matchesStatus && matchesExpiry;
  });

  const filteredCitations = citations.filter(
    (citation) =>
      `${citation.ticketNo} ${citation.type} ${citation.offense} ${citation.status} ${citation.plate}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const driverVehicles = vehicles.filter(
    (vehicle) => vehicle.ownerLicenseNumber === selectedDriver?.licenseNumber
  );

  const filteredVehicles = driverVehicles.filter((vehicle) =>
    `${vehicle.name} ${vehicle.plate} ${vehicle.crNumber} ${vehicle.color} ${vehicle.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openDriver(driver) {
    setSelectedDriver(driver);
    setCitations([]);
    setCitationsLoading(true);
    setSearch("");
    setSelectedTab("Citation History");
    setSelectedCitationId(null);
  }

  function backToTable() {
    setSelectedDriver(null);
    setSearch("");
    setSelectedCitationId(null);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">

      <main className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
        {selectedDriver === null ? (
          <DriverTable
            drivers={filteredDrivers}
            search={tableSearch}
            setSearch={setTableSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            expiryFilter={expiryFilter}
            setExpiryFilter={setExpiryFilter}
            onSelectDriver={openDriver}
            loading={loading}
            onAddLicense={() => setIsLicenseModalOpen(true)}
          />
        ) : (
          <>
            {/* Search and tab controls */}
            <div className="mb-5 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={
                    selectedTab === "Citation History"
                      ? "Search by ticket number or violation..."
                      : "Search by plate number or vehicle..."
                  }
                />

                <FilterSelect
                  value={selectedTab}
                  onChange={(tab) => {
                    setSelectedTab(tab);
                    setSearch("");
                    setSelectedCitationId(null);
                  }}
                  options={["Citation History", "Registered Vehicles"]}
                  aria-label="Choose records to show"
                />
              </div>

              <button
                onClick={backToTable}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                <ArrowLeft size={16} />
                Back to Database
              </button>
            </div>

            

            <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-5">
              <ProfileSummary driver={selectedDriver} />

              {selectedTab === "Citation History" ? (
                <CitationHistory
                  citations={filteredCitations}
                  loading={citationsLoading}
                  selectedCitationId={selectedCitationId}
                  setSelectedCitationId={setSelectedCitationId}
                />
              ) : (
                <RegisteredVehicles vehicles={filteredVehicles} receipts={receipts} />
              )}
            </div>
          </>
        )}
      </main>

      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        onSaved={(row) => {
          setDrivers((current) => [toDriver(row), ...current]);
          setIsLicenseModalOpen(false);
        }}
      />
    </div>
  );
}

function DriverTable({
  drivers,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  expiryFilter,
  setExpiryFilter,
  onSelectDriver,
  loading,
  onAddLicense,
}) {
  return (
    <section className="flex min-h-full flex-1 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by license no..." />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={["All", "Active", "Expired", "Suspended", "Revoked"]} aria-label="Filter by license status" />
              <DatePicker value={expiryFilter} onChange={setExpiryFilter} placeholder="Filter by date" triggerClassName="h-[38px] w-[170px] text-[14px]" aria-label="Filter license records by expiry date" />
            </div>

            <button
              type="button"
              onClick={onAddLicense}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0F2744] px-4 py-2 text-sm font-medium text-white hover:bg-[#173A64]"
            >
              <Plus size={16} />
              Add License
            </button>
          </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[680px] border-collapse text-center">
          <thead className="sticky top-0 z-10 bg-[#E7E9EC]">
            <tr>
              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">License No.</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Full Name</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">DL Codes</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Expiry Date</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody aria-busy={loading}>
            {loading &&
              Array.from({ length: 6 }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: 6 }, (_, columnIndex) => (
                    <td key={columnIndex} className="px-4 py-4">
                      <div className="mx-auto h-4 w-24 animate-pulse rounded bg-slate-200/80" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && drivers.map((driver) => {
              const statusStyle = /suspended/i.test(driver.status)
                ? "border-l-orange-500 bg-orange-50"
                : /expired|revoked/i.test(driver.status)
                  ? "border-l-red-500 bg-red-50"
                  : "border-l-green-600 bg-green-50";

              return (
                <tr
                  key={driver.id}
                  onClick={() => onSelectDriver(driver)}
                  className={`cursor-pointer border-b border-white border-l-[5px] text-sm transition hover:brightness-[0.98] ${statusStyle}`}
                >
                  <td className="px-4 py-3 text-left font-medium">
                    {driver.licenseNumber}
                  </td>
                  <td className="px-4 py-3 font-medium">{driver.fullName}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {driver.restrictionCodes}
                  </td>
                  <td className="px-4 py-3">{formatExpiryDate(driver.expiration)}</td>
                  <td className="px-4 py-3 text-xs">
                    {/suspended/i.test(driver.status)
                      ? "Suspended"
                      : /expired/i.test(driver.status)
                        ? "Expired"
                        : /revoked/i.test(driver.status)
                          ? "Revoked"
                          : "Active"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      aria-label={`View ${driver.fullName}'s license record`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectDriver(driver);
                      }}
                      className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {!loading && drivers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                  No license records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatExpiryDate(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ProfileSummary({ driver }) {
  const statusStyle = /suspended/i.test(driver.status)
    ? "bg-orange-50 text-orange-700"
    : /expired|revoked/i.test(driver.status)
      ? "bg-red-50 text-red-700"
      : "bg-green-50 text-green-700";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Driver&apos;s License
        </h2>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle}`}>
          {driver.status}
        </span>
      </div>

      {/* Front of the card */}
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-blue-700">Front</p>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200">
            <UserRound size={44} className="text-slate-400" />
          </div>
          <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {driver.licenseClass}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          <Info label="Last Name" value={driver.lastName} />
          <Info label="First Name" value={driver.firstName} />
          <Info label="Middle Name" value={driver.middleName} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 text-sm sm:grid-cols-5">
        <Info label="Nationality" value={driver.nationality} />
        <Info label="Sex" value={driver.sex} />
        <Info label="Date of Birth" value={driver.dateOfBirth} />
        <Info label="Weight (kg)" value={driver.weight} />
        <Info label="Height (m)" value={driver.height} />
        <div className="col-span-2 sm:col-span-5">
          <Info label="Address" value={driver.address} />
        </div>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div className="grid grid-cols-2 gap-5 text-sm sm:grid-cols-3">
        <Info label="License No." value={driver.licenseNumber} />
        <Info label="Expiration Date" value={driver.expiration} />
        <Info label="Agency Code" value={driver.agencyCode} />
        <Info label="Blood Type" value={driver.bloodType} />
        <Info label="Eye Color" value={driver.eyeColor} />
        <Info label="DL Codes" value={driver.restrictionCodes} />
        <div className="col-span-2 sm:col-span-3">
          <Info label="Conditions" value={driver.conditions} />
        </div>
      </div>

      {/* Back of the card */}
      <div className="my-6 border-t border-slate-200" />
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-green-700">Back</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Info label="Serial No." value={driver.serialNumber} />
        <Info
          label="Organ Donation"
          value={driver.organDonor ? "I WILL DONATE MY ORGANS" : "I WILL NOT DONATE ANY ORGAN"}
        />
      </div>

      <h3 className="mb-2 mt-5 text-sm font-semibold text-slate-500">In Case of Emergency</h3>
      <div className="space-y-1 text-sm text-slate-600">
        <p>Name: {driver.emergencyName}</p>
        <p>Address: {driver.emergencyAddress}</p>
        <p>Telephone No.: {driver.emergencyPhone}</p>
      </div>

      {/* Not on the card */}
      <div className="my-6 border-t border-slate-200" />
      <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
        LTO record · not printed on the card
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Info label="Demerit Points" value={driver.points} />
        <Info label="Record Status" value={driver.status} />
      </div>
    </section>
  );
}


function CitationHistory({
  citations,
  loading,
  selectedCitationId,
  setSelectedCitationId,
}) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Citation History
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
          {loading ? "Loading..." : `${citations.length} Records`}
        </span>
      </div>

      <div className="space-y-5">
        {citations.map((citation) => {
          const isSelected = selectedCitationId === citation.id;

          const isPending = citation.status !== "Settled";

          const statusClass = isPending
            ? "bg-orange-100 text-orange-700"
            : "bg-green-100 text-green-700";

          const vehicleStatusClass =
            citation.vehicle.status === "VALID"
              ? "bg-green-100 text-green-700"
              : citation.vehicle.status === "NOT REGISTERED"
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700";

          return (
            <article
              key={citation.id}
              role="button"
              tabIndex={0}
              aria-expanded={isSelected}
              onClick={() =>
                setSelectedCitationId((currentId) =>
                  currentId === citation.id ? null : citation.id
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedCitationId((currentId) =>
                    currentId === citation.id ? null : citation.id
                  );
                }
              }}
              className={`cursor-pointer rounded-lg border-2 p-4 transition ${
                isSelected
                  ? "border-orange-500 bg-orange-50/30 shadow-sm"
                  : "border-slate-200 bg-white hover:border-orange-300"
              }`}
            >
              {/* Citation header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Ticket Number
                  </p>
                  <h3 className="break-words text-base font-bold text-slate-800">
                    {citation.ticketNo}
                  </h3>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClass}`}
                >
                  {citation.status}
                </span>
              </div>

              {/* Citation details */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <CitationInfo label="Citation Type" value={citation.type} />
                <CitationInfo label="Violation" value={citation.offense} />
                <CitationInfo label="Date and Time" value={citation.dateTime} />
                <CitationInfo label="Penalty" value={citation.penalty} />
                <CitationInfo
                  label="LTO Code"
                  value={citation.ltoCodes.join(", ") || "—"}
                />
                <CitationInfo
                  label="Plate Number"
                  value={citation.plate}
                />
              </div>

              {/* Expanded details */}
              {isSelected && (
                <div className="mt-6 space-y-6 border-t border-orange-200 pt-5">
                  {/* Evidence */}
                  <div>
                    <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
                      Apprehension Evidence
                    </h4>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div>
                        {citation.videoPath ? (
                          <EvidenceVideo path={citation.videoPath} />
                        ) : (
                          <div className="flex min-h-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-100">
                            <div className="text-center">
                              <PlayCircle
                                size={54}
                                strokeWidth={1.5}
                                className="mx-auto text-slate-500"
                              />
                              <p className="mt-2 text-sm font-medium text-slate-600">
                                Evidence Video
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {citation.video}
                              </p>
                            </div>
                          </div>
                        )}

                      </div>

                      <div className="space-y-4">
                        <CitationInfo
                          label="Citation Type"
                          value={citation.type}
                        />
                        <CitationInfo
                          label="Enforcer"
                          value={citation.enforcerName}
                        />

                        <div className="flex items-start gap-2">
                          <MapPin
                            size={18}
                            className="mt-0.5 shrink-0 text-slate-500"
                          />
                          <div>
                            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                              Location
                            </p>
                            <p className="break-words text-sm font-medium text-slate-800">
                              {citation.location || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle information */}
                  <div className="border-t border-slate-200 pt-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                        Vehicle Information
                      </h4>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${vehicleStatusClass}`}
                      >
                        {citation.vehicle.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-[120px_minmax(0,1fr)]">
                      <div className="flex min-h-28 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                        <CarFront
                          size={68}
                          strokeWidth={1.7}
                          className="text-slate-600"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        <CitationInfo
                          label="Vehicle"
                          value={citation.vehicle.name}
                        />
                        <CitationInfo
                          label="Color"
                          value={citation.vehicle.color}
                        />
                        <CitationInfo
                          label="Plate Number"
                          value={citation.vehicle.plate}
                        />
                        <CitationInfo
                          label="Year Model"
                          value={citation.vehicle.year}
                        />
                        <CitationInfo
                          label="Classification"
                          value={citation.vehicle.classification}
                        />
                        <CitationInfo
                          label="Engine Number"
                          value={citation.vehicle.engine}
                        />
                        <CitationInfo
                          label="MV File Number"
                          value={citation.vehicle.mvFile}
                        />
                        <CitationInfo
                          label="Chassis / VIN"
                          value={citation.vehicle.chassis}
                        />
                      </div>
                    </div>
                  </div>

                  
                </div>
              )}
            </article>
          );
        })}

        {!loading && citations.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No citation history found for this driver.
          </p>
        )}
      </div>
    </section>
  );
}

// The CAMote video of a ticket, played from the private ticket-files bucket with a one-hour signed link
// (admins may read the bucket: app migration 20261027090000). Its clicks stay inside, so the card does not close.
function EvidenceVideo({ path }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.storage
      .from("ticket-files")
      .createSignedUrl(path, 60 * 60)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          console.error("Failed to load the evidence video:", error);
          setFailed(true);
        } else {
          setUrl(data.signedUrl);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <div
      className="flex min-h-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-black"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {url ? (
        <video src={url} controls preload="metadata" playsInline className="aspect-video w-full bg-black" />
      ) : (
        <p className="p-4 text-center text-sm text-slate-300">
          {failed ? "The video could not be loaded." : "Loading video..."}
        </p>
      )}
    </div>
  );
}

function CitationInfo({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="break-words text-sm font-medium leading-relaxed text-slate-800">
        {value}
      </p>
    </div>
  );
}



const VEHICLE_STATUS_STYLES = {
  VALID: { border: "border-green-400", text: "text-green-700", badge: "bg-green-100" },
  EXPIRED: { border: "border-red-400", text: "text-red-700", badge: "bg-red-100" },
  SUSPENDED: { border: "border-orange-400", text: "text-orange-700", badge: "bg-orange-100" },
};

const peso = (value) => `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

function RegisteredVehicles({ vehicles, receipts }) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Registered Vehicles
        </h2>
        <span className="text-sm font-semibold text-slate-500">
          {String(vehicles.length).padStart(2, "0")}
        </span>
      </div>

      <div className="space-y-5">
        {vehicles.map((vehicle, index) => {
          const style = VEHICLE_STATUS_STYLES[vehicle.status] || VEHICLE_STATUS_STYLES.VALID;
          const vehicleReceipts = receipts.filter((receipt) => receipt.vehicleId === vehicle.id);
          const latestReceipt = vehicleReceipts[0];

          return (
            <article
              key={vehicle.id}
              className={`rounded-lg border-2 ${style.border} bg-slate-50 p-4`}
            >
              {/* Vehicle heading */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-md border ${style.border} bg-white text-sm font-semibold ${style.text}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <h3 className="text-base font-semibold text-slate-800">{vehicle.name}</h3>
                    <p className="text-xs text-slate-500">
                      {vehicle.plate} · {vehicle.year} · {vehicle.color}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${style.badge} ${style.text}`}
                >
                  {vehicle.status}
                </span>
              </div>

              {/* CR */}
              <div className="rounded-md border border-blue-200 bg-white p-3">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-700">
                  CR · Certificate of Registration
                </p>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                  <VehicleInfo label="CR Number" value={vehicle.crNumber} />
                  <VehicleInfo label="MV File Number" value={vehicle.mvFile} />
                  <VehicleInfo label="Classification" value={vehicle.classification} />
                  <VehicleInfo label="Body Type" value={vehicle.bodyType} />
                  <VehicleInfo label="Fuel" value={vehicle.fuelType} />
                  <VehicleInfo label="Engine Number" value={vehicle.engine} />
                  <div className="sm:col-span-2">
                    <VehicleInfo label="Chassis / VIN" value={vehicle.chassis} />
                  </div>
                  <VehicleInfo label="Encumbered To" value={vehicle.encumberedTo} />
                  <VehicleInfo label="LTO District Office" value={vehicle.districtOffice} />
                </div>
              </div>

              {/* Latest OR */}
              <div className="mt-3 rounded-md border border-green-200 bg-white p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                    OR · Latest Official Receipt
                  </p>
                  <span className="text-xs text-slate-500">
                    {vehicleReceipts.length} on file
                  </span>
                </div>

                {latestReceipt ? (
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                    <VehicleInfo label="OR Number" value={latestReceipt.orNumber} />
                    <VehicleInfo label="Transaction" value={latestReceipt.transactionType} />
                    <VehicleInfo label="Payment Date" value={latestReceipt.paymentDate} />
                    <VehicleInfo label="Total Paid" value={peso(latestReceipt.total)} />
                    <VehicleInfo label="Valid From" value={latestReceipt.validFrom} />
                    <VehicleInfo label="Valid Until" value={latestReceipt.validUntil} />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No official receipt on file, so the registration is treated as expired.
                  </p>
                )}
              </div>

              {/* Compliance */}
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                <VehicleInfo label="TPL Insurance" value={vehicle.insurance} />
                <VehicleInfo label="LTFRB Franchise" value={vehicle.franchise} />
              </div>
            </article>
          );
        })}

        {vehicles.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No registered vehicles found for this driver.
          </p>
        )}
      </div>
    </section>
  );
}

function VehicleInfo({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="break-words text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}


function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      <p className="break-words text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}
