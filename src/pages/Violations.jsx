
import { useState } from "react";
import { ArrowLeft, ChevronDown, FileDown, Printer, Search } from "lucide-react";
import Logo from "../assets/logo.png";

const violationRecords = [];
const sampleViolationRecords = [
  {
    id: 1,
    ticketNo: "TCK-12341AF",
    date: "2026-8-4",
    time: "1:17 pm",
    enforcer: "A. VARGAS",
    driver: "Toto",
    plate: "JDK32",
    violation: "1A",
    fine: 1500,
    status: "Ticket",
    enforcerName: "Arthur Nery (NCC-101)",
    licenseNumber: "N03-20-123456",
    licenseStatus: "Valid",
    dateOfBirth: "August 23, 2004",
    vehicleType: "Motorcycle - Black",
    gpsCoordinates: "14.74557 / 121.03487",
    transcript: "Beating the red light",
  },
  {
    id: 2,
    ticketNo: "TCK-12341AF",
    date: "2026-8-4",
    time: "1:17 pm",
    enforcer: "A. MORTE",
    driver: "Toto",
    plate: "JDK32",
    violation: "1B",
    fine: 1500,
    status: "Impound",
    enforcerName: "A. MORTE",
    licenseNumber: "—",
    licenseStatus: "—",
    dateOfBirth: "—",
    vehicleType: "—",
    gpsCoordinates: "—",
    transcript: "Violation recorded by the enforcer.",
  },
  {
    id: 3,
    ticketNo: "TCK-12341AF",
    date: "2026-8-4",
    time: "1:17 pm",
    enforcer: "J. VILLA JR.",
    driver: "Toto",
    plate: "JDK32",
    violation: "2A",
    fine: 1500,
    status: "Flagged",
    enforcerName: "J. VILLA JR.",
    licenseNumber: "—",
    licenseStatus: "—",
    dateOfBirth: "—",
    vehicleType: "—",
    gpsCoordinates: "—",
    transcript: "Violation flagged for review.",
  },
];
const displayedViolationRecords =
  violationRecords.length > 0 ? violationRecords : sampleViolationRecords;

const statusOptions = ["All", "Ticket", "Impound", "Flagged"];
const detailFields = [
  ["Enforcer", "enforcerName"],
  ["License Number", "licenseNumber"],
  ["Plate Number", "plate"],
  ["Fine Amount", "fine", (value) => `₱ ${value}`],
  ["Driver / Offender", "driver"],
  ["License Status", "licenseStatus"],
  ["Date & Time", "dateTime"],
  ["GPS Coordinates", "gpsCoordinates"],
  ["Date of Birth", "dateOfBirth"],
  ["Violation", "violation"],
  ["Vehicle Type", "vehicleType"],
];

export default function Violations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedViolation, setSelectedViolation] = useState(null);

  const filteredRecords = displayedViolationRecords.filter((record) => {
    const matchesSearch = [
      record.ticketNo,
      record.date,
      record.time,
      record.enforcer,
      record.driver,
      record.plate,
      record.violation,
      record.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || record.status === statusFilter;
    const normalizedRecordDate = record.date
      .split("-")
      .map((part, index) => (index === 0 ? part : part.padStart(2, "0")))
      .join("-");
    const matchesDate = !dateFilter || normalizedRecordDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });
  const selectedRecord = displayedViolationRecords.find(
    (record) => record.id === selectedViolation
  );

  if (selectedRecord) {
    const dateTime = `${selectedRecord.date} · ${selectedRecord.time}`;

    return (
      <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">
        <main className="flex min-h-0 flex-1 flex-col p-4 md:p-6">
          <button
            type="button"
            onClick={() => setSelectedViolation(null)}
            className="mb-4 inline-flex w-fit items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} />
            Back to Violations
          </button>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-4 bg-[#102D4A] px-4 py-3 text-white md:px-5">
              <div className="flex items-center gap-2">
                <img src={Logo} alt="CAMOTE" className="h-8 w-8 object-contain" />
                <div>
                  <p className="text-base font-black leading-tight tracking-tight">
                    <span className="italic text-orange-500">CAM</span>
                    <span>OTE</span>
                  </p>
                  <p className="text-xs text-slate-200">
                    North Caloocan City Traffic Office - Complete Violation Case
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-semibold md:text-base">
                Ticket No. {selectedRecord.ticketNo}
              </p>
            </header>

            <div className="flex min-h-0 flex-1 flex-col overflow-auto p-5 md:p-8">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                {detailFields.map(([label, key, format]) => {
                  const value = key === "dateTime"
                    ? dateTime
                    : selectedRecord[key];
                  return (
                    <div key={key}>
                      <dt className="text-sm font-medium text-slate-500">{label}</dt>
                      <dd className="mt-1 text-base font-semibold text-slate-900">
                        {format ? format(value) : value || "—"}
                      </dd>
                    </div>
                  );
                })}
              </dl>

              <div className="mt-auto space-y-3 pt-8">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between border-b-2 border-slate-300 py-3 text-sm font-medium text-slate-900">
                    Violation Transcript
                    <ChevronDown size={18} className="transition group-open:rotate-180" />
                  </summary>
                  <p className="py-3 text-sm text-slate-600">{selectedRecord.transcript}</p>
                </details>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between border-b-2 border-slate-300 py-3 text-sm font-medium text-slate-900">
                    Captured Images
                    <ChevronDown size={18} className="transition group-open:rotate-180" />
                  </summary>
                  <p className="py-3 text-sm text-slate-500">
                    No captured images are attached to this violation.
                  </p>
                </details>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between border-b-2 border-slate-300 py-3 text-sm font-medium text-slate-900">
                    Video Recording
                    <ChevronDown size={18} className="transition group-open:rotate-180" />
                  </summary>
                  <p className="py-3 text-sm text-slate-500">
                    No video recording is attached to this violation.
                  </p>
                </details>
              </div>

            </div>
            <footer className="flex shrink-0 flex-wrap gap-2 border-t border-slate-200 bg-white p-4 md:px-6">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 rounded bg-[#102D4A] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1a3b5c]"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                title="Choose Save as PDF in the print dialog"
                className="inline-flex items-center justify-center gap-2 rounded bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-600"
              >
                <FileDown size={16} />
                Export PDF
              </button>
            </footer>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">
      <main className="flex min-h-0 flex-1 p-4 md:p-6">
        <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          {/* Search and status filter */}
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ticket no...."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 sm:w-36"
              aria-label="Filter violations by status"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-auto"
              aria-label="Filter violations by date"
            />
          </div>

          {/* Violations table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="bg-[#0F2744]/10">
                <tr className="border-b-2 border-slate-100 text-xs text-slate-500">
                  {[
                    "Ticket No.",
                    "Date",
                    "Time",
                    "Enforcer",
                    "Driver",
                    "Plate No.",
                    "Violation",
                    "Fine (₱)",
                    "Status",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedViolation(record.id)}
                    className="cursor-pointer border-b border-slate-100 text-xs font-medium transition hover:bg-orange-50/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedViolation(record.id);
                      }
                    }}
                  >
                    <td className="whitespace-nowrap px-3 py-4 text-blue-600">
                      {record.ticketNo}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {record.date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {record.time}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {record.enforcer}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {record.driver}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {record.plate}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      {record.violation}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      ₱ {record.fine}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          record.status === "Ticket"
                            ? "text-700"
                            : record.status === "Impound"
                            ? " text-700"
                            : " text-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No violation records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
      </main>
    </div>
  );
}
