
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CarFront,
  PlayCircle,
  MapPin,
  Plus,
} from "lucide-react";
import SearchInput from "../components/SearchInput";
import FilterSelect from "../components/FilterSelect";
import DatePicker from "../components/DatePicker";
import VehicleModal from "../components/VehicleModal";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import ReceiptModal from "../components/ReceiptModal";
import { toDriver, toVehicle, toReceipt, withExpiry } from "../lib/licenseRecords";

const mockVehicles = [
  {
    plate: "ABC 1234",
    name: "Toyota Vios 1.3 E",
    color: "White",
    year: 2023,
    status: "VALID",
    classification: "Private",
    registeredAt: "2026-10-21",
    engine: "1NR-FE12345",
    mvFile: "NCO-1301-0000984293",
    chassis: "MHFMK9B7K1PK123456",
  },
  {
    plate: "XYZ 9876",
    name: "Honda Civic RS",
    color: "Silver",
    year: 2022,
    status: "EXPIRED",
    classification: "Private",
    registeredAt: "2026-10-20",
    engine: "2NR-123456",
    mvFile: "NCO-1301-0000984294",
    chassis: "MHFMK9B7K1PK123457",
  },
  {
    plate: "DEF 4567",
    name: "Isuzu D-Max LT",
    color: "Black",
    year: 2024,
    status: "SUSPENDED",
    classification: "Commercial",
    registeredAt: "2026-10-19",
    engine: "2NR-123457",
    mvFile: "NCO-1301-0000984295",
    chassis: "MHFMK9B7K1PK123458",
  },
];

const citations = [
  {
    id: 1,
    licenseNumber: "NCO-2024-123456",
    ticketNo: "TC-2026-08912",
    type: "TraffiCam Automated (IoT ANPR)",
    offense: "Red Light Violation (RA 4136)",
    date: "2026-09-14 11:22:04 PST",
    penalty: "₱3,000.00",
    points: 2,
    adjudication: "Unsettled",
    status: "PENDING",
    evidence: {
      cameraId: "ANPR-QUEZON-04",
      enforcer: "Officer Owen",
      location: "Quezon Ave cor. EDSA SB, QC",
      duration: "00:04 / 00:10",
      quality: "720p",
    },
    vehicle: mockVehicles[0],
  },
  {
    id: 2,
    licenseNumber: "NCO-2024-123456",
    ticketNo: "TC-2026-08911",
    type: "MANUAL ENFORCER CITATION",
    offense: "Disregarding Traffic Sign",
    date: "2026-09-10 09:15:30 PST",
    penalty: "₱1,000.00",
    points: 1,
    adjudication: "Settled",
    status: "SETTLED",
    evidence: {
      cameraId: "CAM-QUEZON-02",
      enforcer: "Officer Mark",
      location: "Quezon Avenue, Quezon City",
      duration: "00:02 / 00:08",
      quality: "720p",
    },
    vehicle: mockVehicles[1],
  },
  {
    id: 3,
    licenseNumber: "NCO-2024-654321",
    ticketNo: "TC-2026-08910",
    type: "TraffiCam Automated (IoT ANPR)",
    offense: "Illegal Parking",
    date: "2026-09-08 14:35:12 PST",
    penalty: "₱1,500.00",
    points: 1,
    adjudication: "Unsettled",
    status: "PENDING",
    evidence: {
      cameraId: "ANPR-MAIN-03",
      enforcer: "Officer Daniel",
      location: "Main Road, Quezon City",
      duration: "00:03 / 00:09",
      quality: "720p",
    },
    vehicle: mockVehicles[2],
  },
];

export default function VehicleDatabase() {
  // Initially show the table, not the vehicle record.
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [receiptVehicle, setReceiptVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Activity");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Official Receipts");
  const [selectedCitationId, setSelectedCitationId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadRecords = async () => {
      const [vehiclesResult, licensesResult, receiptsResult] = await Promise.all([
        supabase.from("registered_vehicles").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("driver_licenses").select("*").limit(500),
        supabase.from("vehicle_official_receipts").select("*").order("valid_until", { ascending: false }).limit(2000),
      ]);

      if (cancelled) return;

      const failure = vehiclesResult.error || licensesResult.error || receiptsResult.error;
      if (failure) {
        console.error("Failed to load vehicles:", failure);
        toast.error(`Failed to load vehicles: ${failure.message}`);
      } else {
        setVehicles((vehiclesResult.data || []).map(toVehicle));
        setDrivers((licensesResult.data || []).map(toDriver));
        setReceipts((receiptsResult.data || []).map(toReceipt));
      }
      setLoading(false);
    };

    loadRecords();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null;
  const owner = selectedVehicle
    ? drivers.find((driver) => driver.licenseNumber === selectedVehicle.ownerLicenseNumber) ?? null
    : null;

  const filteredVehiclesTable = vehicles.filter((vehicle) => {
    const matchesSearch =
      `${vehicle.plate} ${vehicle.mvFile} ${vehicle.crNumber} ${vehicle.name}`
        .toLowerCase()
        .includes(tableSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "All Activity" ||
      vehicle.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDate = !dateFilter || vehicle.registeredAt === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const query = search.toLowerCase();

  const vehicleReceipts = receipts.filter(
    (receipt) =>
      receipt.vehicleId === selectedVehicleId &&
      `${receipt.orNumber} ${receipt.transactionType} ${receipt.payorName}`.toLowerCase().includes(query)
  );

  const filteredCitations = citations.filter(
    (citation) =>
      citation.vehicle.plate === selectedVehicle?.plate &&
      `${citation.ticketNo} ${citation.type} ${citation.offense} ${citation.status}`
        .toLowerCase()
        .includes(query)
  );

  function openVehicle(vehicle) {
    setSelectedVehicleId(vehicle.id);
    setSearch("");
    setSelectedTab("Official Receipts");
    setSelectedCitationId(null);
  }

  function backToTable() {
    setSelectedVehicleId(null);
    setSearch("");
    setSelectedCitationId(null);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">

      <main className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:p-6">
        {selectedVehicle === null ? (
          <VehicleTable
            vehicles={filteredVehiclesTable}
            search={tableSearch}
            setSearch={setTableSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            loading={loading}
            onAddVehicle={() => setIsVehicleModalOpen(true)}
            onSelectVehicle={openVehicle}
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
                    selectedTab === "Official Receipts"
                      ? "Search by OR number or payor..."
                      : "Search by ticket number or violation..."
                  }
                />

                <FilterSelect
                  value={selectedTab}
                  onChange={(tab) => {
                    setSelectedTab(tab);
                    setSearch("");
                    setSelectedCitationId(null);
                  }}
                  options={["Official Receipts", "Citation History"]}
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
              <VehicleProfile vehicle={selectedVehicle} owner={owner} />

              {selectedTab === "Official Receipts" ? (
                <ReceiptList
                  receipts={vehicleReceipts}
                  onAddReceipt={() => setReceiptVehicle(selectedVehicle)}
                />
              ) : (
                <CitationHistory
                  citations={filteredCitations}
                  selectedCitationId={selectedCitationId}
                  setSelectedCitationId={setSelectedCitationId}
                  showVehicle={false}
                />
              )}
            </div>
          </>
        )}
      </main>

      <ReceiptModal
        isOpen={receiptVehicle !== null}
        vehicle={receiptVehicle}
        onClose={() => setReceiptVehicle(null)}
        onSaved={(row) => {
          const receipt = toReceipt(row);
          setReceipts((current) => [receipt, ...current].sort((a, b) => b.validUntil.localeCompare(a.validUntil)));
          // The database trigger moved the vehicle's expiry to its latest OR
          setVehicles((current) =>
            current.map((vehicle) => {
              if (vehicle.id !== receipt.vehicleId) return vehicle;
              const latest = [receipt.validUntil, vehicle.registrationExpiry].filter(Boolean).sort().pop();
              return withExpiry(vehicle, latest);
            })
          );
          setReceiptVehicle((vehicle) => (vehicle ? withExpiry(vehicle, receipt.validUntil) : vehicle));
        }}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        licenses={drivers}
        onSaved={(row, receiptRow) => {
          const receipt = receiptRow ? toReceipt(receiptRow) : null;
          // The database trigger set the expiry from the OR, which the insert response predates
          const vehicle = receipt ? withExpiry(toVehicle(row), receipt.validUntil) : toVehicle(row);
          setVehicles((current) => [vehicle, ...current]);
          if (receipt) setReceipts((current) => [receipt, ...current]);
          setIsVehicleModalOpen(false);
        }}
      />
    </div>
  );
}

function VehicleTable({
  vehicles,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onSelectVehicle,
  loading,
  onAddVehicle,
}) {
  return (
    <section className="flex min-h-full flex-1 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by plate no...." />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={["All Activity", "Valid", "Expired", "Suspended"]} aria-label="Filter vehicles by status" />
              <DatePicker value={dateFilter} onChange={setDateFilter} placeholder="Filter by date" triggerClassName="h-[38px] w-[170px] text-[14px]" aria-label="Filter vehicles by registration date" />
            </div>

            <button
              type="button"
              onClick={onAddVehicle}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#0F2744] px-4 py-2 text-sm font-medium text-white hover:bg-[#173A64]"
            >
              <Plus size={16} />
              Add Vehicle
            </button>
          </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[760px] border-collapse text-center">
          <thead className="sticky top-0 z-10 bg-[#E7E9EC]">
            <tr>
              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Plate No.</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">CR No.</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">MV File No.</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Make &amp; Model</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Year</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Classification</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody aria-busy={loading}>
            {loading &&
              Array.from({ length: 6 }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`}>
                  {Array.from({ length: 7 }, (_, columnIndex) => (
                    <td key={columnIndex} className="px-4 py-4">
                      <div className="mx-auto h-4 w-24 animate-pulse rounded bg-slate-200/80" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && vehicles.map((vehicle) => {
              const statusStyle =
                vehicle.status === "SUSPENDED"
                  ? "border-l-orange-500 bg-orange-50"
                  : vehicle.status === "EXPIRED"
                    ? "border-l-red-500 bg-red-50"
                    : "border-l-green-600 bg-green-50";

              return (
                <tr
                  key={vehicle.plate}
                  onClick={() => onSelectVehicle(vehicle)}
                  className={`cursor-pointer border-b border-white border-l-[5px] text-sm transition hover:brightness-[0.98] ${statusStyle}`}
                >
                  <td className="px-4 py-3 text-left font-medium">{vehicle.plate}</td>
                  <td className="px-4 py-3">{vehicle.crNumber}</td>
                  <td className="px-4 py-3">{vehicle.mvFile}</td>
                  <td className="px-4 py-3 font-medium">{vehicle.name}</td>
                  <td className="px-4 py-3">{vehicle.year}</td>
                  <td className="px-4 py-3">{vehicle.classification}</td>
                  <td className="px-4 py-3 capitalize">{vehicle.status.toLowerCase()}</td>
                </tr>
              );
            })}

            {!loading && vehicles.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  No vehicle records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const VEHICLE_STATUS_STYLES = {
  VALID: { border: "border-green-400", text: "text-green-700", badge: "bg-green-100" },
  EXPIRED: { border: "border-red-400", text: "text-red-700", badge: "bg-red-100" },
  SUSPENDED: { border: "border-orange-400", text: "text-orange-700", badge: "bg-orange-100" },
};

// The vehicle is the subject: its CR first, then registration status and the registered owner
function VehicleProfile({ vehicle, owner }) {
  const style = VEHICLE_STATUS_STYLES[vehicle.status] || VEHICLE_STATUS_STYLES.VALID;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Vehicle Record
        </h2>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${style.badge} ${style.text}`}>
          {vehicle.status}
        </span>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <CarFront size={52} strokeWidth={1.5} className="text-slate-500" />
          </div>
          <span className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm font-bold tracking-wide text-slate-800">
            {vehicle.plate}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-800">{vehicle.name}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {vehicle.year} · {vehicle.color} · {vehicle.classification}
          </p>
        </div>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <h3 className="mb-3 text-sm font-semibold text-slate-500">I. Certificate of Registration (CR)</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VehicleInfo label="CR Number" value={vehicle.crNumber} />
        <VehicleInfo label="MV File Number" value={vehicle.mvFile} />
        <VehicleInfo label="Plate Number" value={vehicle.plate} />
        <VehicleInfo label="Classification" value={vehicle.classification} />
        <VehicleInfo label="Make" value={vehicle.make} />
        <VehicleInfo label="Series" value={vehicle.series} />
        <VehicleInfo label="Body Type" value={vehicle.bodyType} />
        <VehicleInfo label="Year Model" value={vehicle.year} />
        <VehicleInfo label="Color" value={vehicle.color} />
        <VehicleInfo label="Fuel" value={vehicle.fuelType} />
        <VehicleInfo label="Engine Number" value={vehicle.engine} />
        <VehicleInfo label="Chassis / VIN" value={vehicle.chassis} />
        <VehicleInfo label="Piston Displacement (cc)" value={vehicle.pistonDisplacement} />
        <VehicleInfo label="No. of Cylinders" value={vehicle.cylinders} />
        <VehicleInfo label="Gross Weight (kg)" value={vehicle.grossWeight} />
        <VehicleInfo label="Net Weight (kg)" value={vehicle.netWeight} />
        <VehicleInfo label="Net Capacity (kg)" value={vehicle.netCapacity} />
        <VehicleInfo label="Date Registered" value={vehicle.registeredAt} />
      </div>

      <div className="my-5 border-t border-slate-100" />

      <h3 className="mb-3 text-sm font-semibold text-slate-500">II. Registration Status</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VehicleInfo label="LTO Registration" value={vehicle.status} />
        <VehicleInfo label="Valid Until (latest OR)" value={vehicle.registrationExpiry || "No OR on file"} />
        <VehicleInfo label="TPL Insurance" value={vehicle.insurance} />
        <VehicleInfo label="LTFRB Franchise" value={vehicle.franchise} />
        <VehicleInfo label="LTO District Office" value={vehicle.districtOffice} />
        <VehicleInfo label="Encumbered To" value={vehicle.encumberedTo} />
      </div>

      <div className="my-5 border-t border-slate-100" />

      <h3 className="mb-3 text-sm font-semibold text-slate-500">III. Registered Owner</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VehicleInfo label="Name" value={vehicle.ownerName} />
        <VehicleInfo label="License Number" value={vehicle.ownerLicenseNumber || "Not linked"} />
        <div className="sm:col-span-2">
          <VehicleInfo label="Address" value={vehicle.ownerAddress} />
        </div>
        {owner && (
          <>
            <VehicleInfo label="License Status" value={owner.status} />
            <VehicleInfo label="License Expiration" value={owner.expiration} />
          </>
        )}
      </div>
    </section>
  );
}

function CitationHistory({
  citations,
  selectedCitationId,
  setSelectedCitationId,
  showVehicle = true,
}) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Citation History
        </h2>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
          {citations.length} Records
        </span>
      </div>

      <div className="space-y-5">
        {citations.map((citation) => {
          const isSelected = selectedCitationId === citation.id;

          const isPending = citation.status === "PENDING";

          const statusClass = isPending
            ? "bg-orange-100 text-orange-700"
            : "bg-green-100 text-green-700";

          const vehicleStatusClass =
            citation.vehicle.status === "VALID"
              ? "bg-green-100 text-green-700"
              : citation.vehicle.status === "WARNING"
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
                <CitationInfo label="Date and Time" value={citation.date} />
                <CitationInfo label="Penalty" value={citation.penalty} />
                <CitationInfo
                  label="Demerit Points"
                  value={`+${citation.points} points`}
                />
                <CitationInfo
                  label="Adjudication"
                  value={citation.adjudication}
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
                              {citation.evidence.quality}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex justify-between text-xs text-slate-500">
                          <span>Duration</span>
                          <span>{citation.evidence.duration}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <CitationInfo
                          label="Camera ID"
                          value={citation.evidence.cameraId}
                        />
                        <CitationInfo
                          label="Enforcer"
                          value={citation.evidence.enforcer}
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
                              {citation.evidence.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle information */}
                  {showVehicle && (
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

                  )}
                  
                </div>
              )}
            </article>
          );
        })}

        {citations.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No citation history found.
          </p>
        )}
      </div>
    </section>
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



function ReceiptList({ receipts, onAddReceipt }) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Official Receipts (OR)
          </h2>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
            {receipts.length} Records
          </span>
        </div>
        <button
          type="button"
          onClick={onAddReceipt}
          className="cursor-pointer rounded-md bg-[#0F2744] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#173A64]"
        >
          Add OR
        </button>
      </div>

      <div className="space-y-5">
        {receipts.map((receipt) => (
          <article key={receipt.id} className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  OR Number
                </p>
                <h3 className="break-words text-base font-bold text-slate-800">{receipt.orNumber}</h3>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {receipt.transactionType}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <VehicleInfo label="Payment Date" value={receipt.paymentDate} />
              <VehicleInfo label="Payor" value={receipt.payorName} />
              <VehicleInfo label="Valid From" value={receipt.validFrom} />
              <VehicleInfo label="Valid Until" value={receipt.validUntil} />
              <div className="sm:col-span-2">
                <VehicleInfo
                  label="Fees"
                  value={
                    [
                      ["Registration", receipt.registrationFee],
                      ["Plate", receipt.plateFee],
                      ["MVUC", receipt.mvucFee],
                      ["Penalty", receipt.penaltyFee],
                      ["Other", receipt.otherFees],
                    ]
                      .filter(([, fee]) => fee > 0)
                      .map(([name, fee]) => `${name} ₱${fee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`)
                      .join(" · ") || "—"
                  }
                />
              </div>
              <VehicleInfo
                label="Total Paid"
                value={`₱${receipt.total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
              />
            </div>
          </article>
        ))}

        {receipts.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No official receipts on file.
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
