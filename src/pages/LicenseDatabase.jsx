
import { useState } from "react";
import {
  ArrowLeft,
  CarFront,
  UserRound,
  PlayCircle,
  MapPin,
  MoreVertical,
} from "lucide-react";
import SearchInput from "../components/SearchInput";
import FilterSelect from "../components/FilterSelect";
import DatePicker from "../components/DatePicker";

const drivers = [
  {
    id: 1,
    fullName: "Arthur N. Nery",
    licenseNumber: "NCO-2024-123456",
    dateOfBirth: "December 5, 2000",
    expiration: "December 5, 2028",
    licenseClass: "Non-Professional",
    status: "Valid - Active",
    points: "04 / 40 (Low Risk)",
    address: "Mandaluyong City, Metro Manila",
  },
  {
    id: 2,
    fullName: "Juan Dela Cruz",
    licenseNumber: "NCO-2024-654321",
    dateOfBirth: "March 15, 1998",
    expiration: "March 15, 2028",
    licenseClass: "Professional",
    status: "Valid - Active",
    points: "02 / 40 (Low Risk)",
    address: "Quezon City, Metro Manila",
  },
  {
    id: 3,
    fullName: "Maria Santos",
    licenseNumber: "NCO-2024-789012",
    dateOfBirth: "July 20, 2001",
    expiration: "July 20, 2029",
    licenseClass: "Non-Professional",
    status: "Valid - Active",
    points: "01 / 40 (Low Risk)",
    address: "Caloocan City, Metro Manila",
  },
  {
    id: 4,
    fullName: "Agnes Tamayo",
    licenseNumber: "NCO-2021-321654",
    dateOfBirth: "September 12, 1989",
    expiration: "September 30, 2024",
    licenseClass: "Professional",
    status: "Expired",
    points: "12 / 40 (Moderate Risk)",
    address: "Caloocan City, Metro Manila",
  },
  {
    id: 5,
    fullName: "Ivan Torculas",
    licenseNumber: "NCO-2022-456789",
    dateOfBirth: "June 8, 1992",
    expiration: "May 14, 2027",
    licenseClass: "Non-Professional",
    status: "Suspended",
    points: "24 / 40 (High Risk)",
    address: "Quezon City, Metro Manila",
  },
];

const vehicles = [
  {
    plate: "ABC 1234",
    name: "Toyota Vios 1.3 E",
    color: "White",
    year: 2023,
    status: "VALID",
    classification: "Private",
    engine: "1NR-FE12345",
    mvFile: "NCO-1301-0000984293",
    chassis: "MHFMK9B7K1PK123456",
  },
  {
    plate: "XYZ 5678",
    name: "Toyota Vios 1.3 E",
    color: "Silver",
    year: 2022,
    status: "WARNING",
    classification: "Private",
    engine: "2NR-123456",
    mvFile: "NCO-1301-0000984294",
    chassis: "MHFMK9B7K1PK123457",
  },
  {
    plate: "DEF 9012",
    name: "Toyota Vios 1.3 E",
    color: "Black",
    year: 2021,
    status: "FLAGGED",
    classification: "Private",
    engine: "2NR-123457",
    mvFile: "NCO-1301-0000984295",
    chassis: "MHFMK9B7K1PK123458",
  },
];

const citations = [
  {
    id: 1,
    driverId: 1,
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
    vehicle: vehicles[0],
  },
  {
    id: 2,
    driverId: 1,
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
    vehicle: vehicles[1],
  },
  {
    id: 3,
    driverId: 2,
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
    vehicle: vehicles[2],
  },
];

export default function LicenseDatabase() {
  // Initially show the table, not the profile.
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [tableSearch, setTableSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expiryFilter, setExpiryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Citation History");
  const [selectedCitationId, setSelectedCitationId] = useState(null);

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      `${driver.fullName} ${driver.licenseNumber} ${driver.dateOfBirth}`
        .toLowerCase()
        .includes(tableSearch.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && /active/i.test(driver.status)) ||
      (statusFilter === "Expired" && /expired/i.test(driver.status)) ||
      (statusFilter === "Suspended" && /suspended/i.test(driver.status));
    const matchesExpiry =
      !expiryFilter || formatExpiryDate(driver.expiration) === expiryFilter;

    return matchesSearch && matchesStatus && matchesExpiry;
  });

  const filteredCitations = citations.filter(
    (citation) =>
      citation.driverId === selectedDriver?.id &&
      `${citation.ticketNo} ${citation.type} ${citation.offense} ${citation.status}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const driverVehicles = vehicles.filter((vehicle) =>
    citations.some(
      (citation) =>
        citation.driverId === selectedDriver?.id &&
        citation.vehicle.plate === vehicle.plate
    )
  );

  const filteredVehicles = driverVehicles.filter((vehicle) =>
    `${vehicle.name} ${vehicle.plate} ${vehicle.color} ${vehicle.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openDriver(driver) {
    setSelectedDriver(driver);
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
                  selectedCitationId={selectedCitationId}
                  setSelectedCitationId={setSelectedCitationId}
                />
              ) : (
                <RegisteredVehicles vehicles={filteredVehicles} />
              )}
            </div>
          </>
        )}
      </main>
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
}) {
  return (
    <section className="flex min-h-full flex-1 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by license no..." />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={["All", "Active", "Expired", "Suspended"]} aria-label="Filter by license status" />
              <DatePicker value={expiryFilter} onChange={setExpiryFilter} placeholder="Filter by date" triggerClassName="h-[38px] w-[170px] text-[14px]" aria-label="Filter license records by expiry date" />
            </div>
          </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[680px] border-collapse text-center">
          <thead className="sticky top-0 z-10 bg-[#E7E9EC]">
            <tr>
              <th className="whitespace-nowrap px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">License No.</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Full Name</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Restriction Code</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Expiry Date</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
              <th className="whitespace-nowrap px-4 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((driver) => {
              const statusStyle = /suspended/i.test(driver.status)
                ? "border-l-orange-500 bg-orange-50"
                : /expired/i.test(driver.status)
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
                    A, A1, B, B1, B2, C
                  </td>
                  <td className="px-4 py-3">{formatExpiryDate(driver.expiration)}</td>
                  <td className="px-4 py-3 text-xs">
                    {/suspended/i.test(driver.status)
                      ? "Suspended"
                      : /expired/i.test(driver.status)
                        ? "Expired"
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

            {drivers.length === 0 && (
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
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Profile Summary
      </h2>

      <div className="flex flex-col gap-5 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200">
            <UserRound size={44} className="text-slate-400" />
          </div>
          <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            Active
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
          <Info label="Driver's Name" value={driver.fullName} />
          <Info />
          <Info label="License Number" value={driver.licenseNumber} />
          <Info label="License Expiration" value={driver.expiration} />
          <Info label="Class" value={driver.licenseClass} />
          <Info label="Status Badge" value={driver.status} />
        </div>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Info label="Demerit Points" value={driver.points} />
        <Info label="Restriction DL Codes" value="A, A1, B, B1, B2, C" />
      </div>

      <div className="my-5 border-t border-slate-100" />

      <h3 className="mb-3 text-sm font-semibold text-slate-500">II. Conditions</h3>
      <p className="text-sm text-slate-600">
        A: Wear corrective lenses (glasses or contact lenses).
      </p>

      <div className="my-5 border-t border-slate-100" />

      <h3 className="mb-3 text-sm font-semibold text-slate-500">III. Organ donation</h3>
      <p className="text-sm text-slate-600">
        I WILL NOT DONATE ANY ORGAN
      </p>



      <div className="my-5 border-t border-slate-100" />

      <h3 className="mb-2 text-sm font-semibold text-slate-500">
        IV. In Case of Emergency
      </h3>
      <div className="space-y-1 text-sm text-slate-600">
        <p>Name: Leo Carlo C, Atay</p>
        <p>Address: Blk 9, Lot 6 Brgy. 181 Caloocan City</p>
        <p>Telephone No.: 09892343789</p>
      </div>

      <div className="my-5 border-t border-slate-100" />

      <div className="grid grid-cols-2 gap-5 text-sm sm:grid-cols-5">
        <Info label="Date of Birth" value={driver.dateOfBirth} />
        <Info label="Nationality" value="PHIL" />
        <Info label="Sex" value="M" />
        <Info label="Weight" value="65" />
        <Info label="Height" value="65" />
        <div className="col-span-2 sm:col-span-5">
          <Info label="Address" value={driver.address} />

          <div className="my-5 border-t border-slate-100 grid grid-cols-2 gap-5 text-sm sm:grid-cols-5">
        <Info label="Blood Type" value="O+" />
        <Info label="Eye Color" value="Black " />
        <Info label="Agency Code" value="004" />
          </div>
        </div>
      </div>
    </section>
  );
}


function CitationHistory({
  citations,
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

        {citations.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            No citation history found for this driver.
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



function RegisteredVehicles({ vehicles }) {
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
          const statusStyles = {
            VALID: {
              border: "border-green-400",
              text: "text-green-700",
              badge: "bg-green-100",
            },
            WARNING: {
              border: "border-amber-400",
              text: "text-amber-700",
              badge: "bg-amber-100",
            },
            FLAGGED: {
              border: "border-red-400",
              text: "text-red-700",
              badge: "bg-red-100",
            },
          };

          const style = statusStyles[vehicle.status] || statusStyles.VALID;

          return (
            <article
              key={vehicle.plate}
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

                  <h3 className="text-base font-semibold text-slate-800">
                    {vehicle.name}
                  </h3>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-bold ${style.badge} ${style.text}`}
                >
                  {vehicle.status}
                </span>
              </div>

              {/* Vehicle image and information */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                <div>
                  <div className="flex h-28 items-center justify-center rounded-lg border border-slate-200 bg-white">
                    <CarFront size={68} strokeWidth={1.7} className="text-slate-600" />
                  </div>

                  <p className="mt-2 text-center text-xs text-slate-400">
                    Vehicle Preview
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                  <VehicleInfo label="Color" value={vehicle.color} />
                  <VehicleInfo label="Plate Number" value={vehicle.plate} />
                  <VehicleInfo label="Year Model" value={vehicle.year} />
                  <VehicleInfo label="Classification" value={vehicle.classification} />
                  <VehicleInfo label="Engine Number" value={vehicle.engine} />
                  <VehicleInfo label="MV File Number" value={vehicle.mvFile} />
                  <div className="sm:col-span-2">
                    <VehicleInfo label="Chassis / VIN" value={vehicle.chassis} />
                  </div>
                </div>
              </div>

              {/* Compliance and franchise */}
              <div className="mt-5 border-t border-slate-200 pt-4">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Compliance &amp; Franchise Badges
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-600">LTO Reg: VALID (Exp: Oct 2026)</span>
  
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-600">TPL Ins: VALID (PGA Ins Corp)</span>
                    
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-slate-600">Franchise: N/A (Private)</span>
                    
                  </div>
                </div>
              </div>

              {/* Registration metadata */}
              <div className="mt-5 border-t border-slate-200 pt-4">
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Registration &amp; Insurance Metadata
                </h4>

                <div className="space-y-3 text-sm">
                  <VehicleInfo
                    label="LTO District Office"
                    value="Diliman District Office"
                  />
                  <VehicleInfo
                    label="LTFRB Franchise"
                    value="N/A — Private Passenger"
                  />
                  <VehicleInfo
                    label="Encumbrance / Mortgage"
                    value="Bank of the Philippine Islands"
                  />
                </div>
              </div>

              {/* Historical logs */}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  // Connect to historical logs page or modal.
                }}
                className={`mt-5 w-full rounded-lg border-2 ${style.border} bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-100`}
              >
                View Full Historical Logs
              </button>
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
