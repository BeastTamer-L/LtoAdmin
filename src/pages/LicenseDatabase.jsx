
import { useState } from "react";
import {
  Search,
  ArrowLeft,
  CarFront,
  UserRound,
  ShieldCheck,
  FileText,
  CalendarDays,
  Ticket,
  Clock,
  CircleCheck,
  PlayCircle,
  MapPin,
  User,
  ChevronLeft,
} from "lucide-react";

export default function LicenseDatabase() {
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("Citation History");
  const [selectedCitationId, setSelectedCitationId] = useState(1);

  // Sample registered vehicle records
  const vehicles = [
    {
      plate: "ABC-1234",
      name: "Freedom White",
      color: "White",
      year: 2023,
      status: "VALID",
      badge: "bg-green-100 text-green-700",
      border: "border-green-300",
      classification: "Private",
      engine: "1NR-FE12345",
      mvFile: "NCO-1301-0000984293",
      chassis: "MHFMK9B7K1PK123456",
    },
    {
      plate: "NCO-2024-123457",
      name: "Toyota Vios 1.3 E",
      color: "Silver",
      year: 2022,
      status: "WARNING",
      badge: "bg-yellow-100 text-yellow-700",
      border: "border-yellow-300",
      classification: "Private",
      engine: "2NR-123456",
      mvFile: "NCO-1301-0000984294",
      chassis: "MHFMK9B7K1PK123457",
    },
    {
      plate: "NCO-2024-123458",
      name: "Toyota Vios 1.3 E",
      color: "Black",
      year: 2021,
      status: "FLAGGED",
      badge: "bg-red-100 text-red-700",
      border: "border-red-300",
      classification: "Private",
      engine: "2NR-123457",
      mvFile: "NCO-1301-0000984295",
      chassis: "MHFMK9B7K1PK123458",
    },
  ];

  // Sample citation records
  const citations = [
    {
      id: 1,
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

  const filteredVehicles = vehicles.filter((vehicle) =>
    `${vehicle.name} ${vehicle.plate} ${vehicle.status} ${vehicle.color}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const filteredCitations = citations.filter((citation) =>
    `${citation.ticketNo} ${citation.type} ${citation.offense} ${citation.status} ${citation.adjudication}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleTabChange = (e) => {
    setSelectedTab(e.target.value);
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <main className="p-4 md:p-6">
        {/* Search, tab dropdown, and back button */}
        <div className="mb-5 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                selectedTab === "Citation History"
                  ? "Search by ticket no..."
                  : "Search by plate number, vehicle, or status..."
              }
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={selectedTab}
            onChange={handleTabChange}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 lg:w-52"
          >
            <option value="Citation History">Citation History</option>
            <option value="Registered Vehicles">Registered Vehicles</option>
          </select>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Go Back to Dashboard
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-5">
          {/* LEFT: Profile Summary */}
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
                <Info label="Driver's Name" value="Arthur N. Nery" />
                <Info label="License Number" value="NCO-2024-123456" />
                <Info label="License Expiration" value="0000/00/00" />
                <Info label="Class" value="Non-Professional" />
                <Info label="Status Badge" value="Valid - Active" />
              </div>
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Info label="Demerit Points" value="04 / 40 (Low Risk)" />
              <Info label="I. Restriction DL Codes" value="A, A1, B, B1, B2, C" />
            </div>

            <div className="my-5 border-t border-slate-100" />

            <h3 className="mb-3 text-sm font-semibold text-slate-500">
              II. Conditions
            </h3>

            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">
                  A: Wearing corrective lenses (glasses or contact lenses).
                </span>
              </p>

              <p>
                <span className="font-medium text-slate-800">
                  III. Organ Donation
                </span>
                <br />
                I WILL NOT DONATE ANY ORGAN
              </p>

              <p>
                <span className="font-medium text-slate-800">
                  IV. In case of Emergency
                </span>
                <br />
                NAME: Leo Carlo C. Atay
                <br />
                ADDRESS: Blk 9, Lot 6 Brgy. 181 Caloocan City
                <br />
                TEL. NO.: 09923434789
              </p>
            </div>

            <div className="my-5 border-t border-slate-100" />

            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Info label="Date of Birth" value="12/05/2000" />
              <Info label="Nationality" value="PHL" />
              <Info label="Sex" value="M" />
              <Info label="Weight (kg)" value="65" />
              <Info label="Height (m)" value="65" />
              <Info label="Blood Type" value="O+" />
              <Info label="Eye Color" value="Black" />
              <Info label="Agency Code" value="004" />

              <div className="col-span-2 sm:col-span-3">
                <Info
                  label="Address"
                  value="6F Robinsons Cybergate Center Tower 3 Robinsons Pioneer Complex St. Mandaluyong City"
                />
              </div>
            </div>
          </section>

          {/* RIGHT: Citation History or Registered Vehicles */}
          {selectedTab === "Citation History" ? (
            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Citation History
                </h2>

                <span className="text-xs text-slate-400">
                  {filteredCitations.length} records
                </span>
              </div>

              <div className="space-y-4">
                {filteredCitations.map((citation) => {
                  const isSelected =
                    selectedCitationId === citation.id;

                  return (
                    <article
                      key={citation.id}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isSelected}
                      onClick={() =>
                        setSelectedCitationId((currentId) => 
                          currentId === citation.id ? null : citation.id)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedCitationId(citation.id);
                        }
                      }}
                      className={`cursor-pointer rounded-md border p-3 transition ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/20"
                          : "border-slate-200 hover:border-orange-300"
                      }`}
                    >
                      {/* Citation summary */}
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                              isSelected
                                ? "border-orange-500 text-orange-600"
                                : "border-slate-300 text-slate-500"
                            }`}
                          >
                            {String(citation.id).padStart(2, "0")}
                          </span>

                          <h3 className="break-words text-xs font-semibold text-slate-700">
                            UOVR # {citation.ticketNo}
                          </h3>
                        </div>

                        <span
                          className={`shrink-0 text-[10px] font-bold ${
                            citation.status === "PENDING"
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {citation.status}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-[11px] leading-relaxed text-slate-600">
                        <p>Type: {citation.type}</p>
                        <p>Offense: {citation.offense}</p>
                        <p>Date/Time: {citation.date}</p>
                        <p>Penalty: {citation.penalty}</p>
                        <p>Demerit Points: +{citation.points}</p>
                        <p>Adjudication: {citation.adjudication}</p>
                      </div>

                      {/* Expanded details only for selected citation */}
                      {isSelected && (
                        <div className="mt-3 border-t border-orange-300 pt-3">
                          {/* Evidence section */}
                          <h4 className="mb-2 text-[11px] font-semibold uppercase text-slate-700">
                            Apprehension Evidence
                          </h4>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {/* Video placeholder */}
                            <div>
                              <div className="flex h-24 items-center justify-center bg-slate-200">
                                <PlayCircle
                                  size={34}
                                  className="text-white"
                                />
                              </div>

                              <div className="mt-1 flex justify-between gap-2 text-[9px] text-slate-500">
                                <span>
                                  Play | {citation.evidence.duration}
                                </span>
                                <span>{citation.evidence.quality}</span>
                              </div>
                            </div>

                            {/* Evidence metadata */}
                            <div className="space-y-1 break-words text-[10px] leading-relaxed text-slate-600">
                              <p>
                                Cam ID: {citation.evidence.cameraId}
                              </p>
                              <p>
                                Enforcer: {citation.evidence.enforcer}
                              </p>
                              <p>
                                <MapPin
                                  size={11}
                                  className="mr-1 inline"
                                />
                                Location: {citation.evidence.location}
                              </p>
                            </div>
                          </div>

                          <div className="my-3 border-t border-orange-200" />

                          {/* Vehicle information */}
                          <h4 className="mb-2 text-[11px] font-semibold uppercase text-slate-700">
                            Vehicle Information
                          </h4>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[90px_1fr]">
                            <div className="flex h-20 items-center justify-center rounded-md bg-slate-50">
                              <CarFront
                                size={40}
                                className="text-slate-700"
                              />
                            </div>

                            <div className="space-y-0.5 break-words text-[10px] leading-relaxed text-slate-600">
                              <p>
                                <span className="font-medium text-slate-700">
                                  Color:
                                </span>{" "}
                                {citation.vehicle.color}
                              </p>
                              <p>
                                <span className="font-medium text-slate-700">
                                  Plate Number:
                                </span>{" "}
                                {citation.vehicle.plate}
                              </p>
                              <p>
                                <span className="font-medium text-slate-700">
                                  Year:
                                </span>{" "}
                                {citation.vehicle.year}
                              </p>
                              <p>
                                <span className="font-medium text-slate-700">
                                  Classification:
                                </span>{" "}
                                {citation.vehicle.classification}
                              </p>
                              <p>
                                <span className="font-medium text-slate-700">
                                  Engine:
                                </span>{" "}
                                {citation.vehicle.engine}
                              </p>
                              <p>
                                <span className="font-medium text-slate-700">
                                  MV File No.:
                                </span>{" "}
                                {citation.vehicle.mvFile}
                              </p>
                              <p>
                                <span className="font-medium text-slate-700">
                                  Chassis/VIN:
                                </span>{" "}
                                {citation.vehicle.chassis}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between border-t border-orange-200 pt-2 text-[10px]">
                            <span className="text-slate-500">
                              Registration Status
                            </span>

                            <span className="font-semibold text-green-700">
                              {citation.vehicle.status}
                            </span>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}

                {filteredCitations.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No citation history found.
                  </p>
                )}
              </div>
            </section>
          ) : (
            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Registered Vehicles
                </h2>

                <span className="text-xs text-slate-400">
                  {filteredVehicles.length} records
                </span>
              </div>

              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <article
                    key={vehicle.plate}
                    className={`rounded-md border ${vehicle.border} p-3`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <CarFront
                          size={18}
                          className="shrink-0 text-slate-500"
                        />

                        <h3 className="text-sm font-semibold">
                          {vehicle.name}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 rounded px-2 py-1 text-[10px] font-bold ${vehicle.badge}`}
                      >
                        {vehicle.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex h-20 items-center justify-center rounded-md bg-slate-50">
                        <CarFront
                          size={48}
                          className="text-slate-700"
                        />
                      </div>

                      <div className="space-y-1 break-words text-xs text-slate-600">
                        <p>Plate Number: {vehicle.plate}</p>
                        <p>Color: {vehicle.color}</p>
                        <p>Year: {vehicle.year}</p>
                        <p>Vehicle Type: {vehicle.classification}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <h4 className="mb-2 text-xs font-semibold">
                        Compliance &amp; Franchise Details
                      </h4>

                      <div className="space-y-1 break-words text-xs text-slate-500">
                        <p>LTMS Registration: Active</p>
                        <p>Franchise: N/A (Private)</p>
                        <p>Registration Status: {vehicle.status}</p>
                        <p>Engine: {vehicle.engine}</p>
                        <p>MV File No.: {vehicle.mvFile}</p>
                        <p>Chassis/VIN: {vehicle.chassis}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        window.alert(
                          `Vehicle: ${vehicle.plate}\nHistorical logs will be connected to your database.`
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded border border-blue-200 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                    >
                      <CalendarDays size={14} />
                      View Full Historical Logs
                    </button>
                  </article>
                ))}

                {filteredVehicles.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No registered vehicles found.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>
      </main>
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