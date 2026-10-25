
import { useState } from "react";
import {
  Search,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Logo from "../assets/logo.png";

const today = new Date();
const todayKey = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

const activityLogs = [
  {
    id: 1,
    time: "10:24 AM",
    date: "TODAY",
    dateKey: todayKey,
    deviceId: "M0967",
    enforcer: "A. MORTE",
    rank: "T. Enforcer I",
    location: "205 Deparo Rd, Caloocan",
    sector: "DEPARO SECTOR",
    activity: "Roadside Apprehension",
  },
  {
    id: 2,
    time: "10:24 AM",
    date: "TODAY",
    dateKey: todayKey,
    deviceId: "M0967",
    enforcer: "J. VILLA JR.",
    rank: "T. Enforcer I",
    location: "205 Deparo Rd, Caloocan",
    sector: "DEPARO SECTOR",
    activity: "Device Shut Down",
  },
  {
    id: 3,
    time: "10:24 AM",
    date: "TODAY",
    dateKey: todayKey,
    deviceId: "S0967",
    enforcer: "A. ESPINO",
    rank: "T. Enforcer I",
    location: "205 Deparo Rd, Caloocan",
    sector: "DEPARO SECTOR",
    activity: "Backup Call",
  },
];

const sectors = [
  "All Sectors",
  "Vicas",
  "Maligaya",
  "Malaria",
  "Deparo",
  "Almar",
  "Saranay",
];

export default function AuditTrail() {
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("All Activity");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      `${log.deviceId} ${log.enforcer} ${log.location} ${log.activity}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesActivity =
      activityFilter === "All Activity" ||
      log.activity === activityFilter;

    const matchesSector =
      selectedSector === "All Sectors" ||
      log.sector.toLowerCase().includes(selectedSector.toLowerCase());
    const matchesDate = !selectedDate || log.dateKey === selectedDate;

    return matchesSearch && matchesActivity && matchesSector && matchesDate;
  });
  const selectedActivity = activityLogs.find((log) => log.id === selectedLog);

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">
      <main
        className={`flex min-h-0 flex-1 ${
          selectedActivity ? "" : "p-4 md:p-6"
        }`}
      >
        {selectedActivity ? (
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
            

            <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Back to Enforcer&apos;s Activity Log
              </button>

              <aside className="absolute right-5 top-20 w-[min(260px,calc(100%-2.5rem))] rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:right-8">
                <img
                  src={Logo}
                  alt="CAMOTE"
                  className="mx-auto mb-4 h-24 w-24 rounded-full bg-white object-contain p-2"
                />
                <p className="text-sm font-bold text-slate-950">
                  {selectedActivity.enforcer}
                </p>
                <p className="text-sm font-semibold text-green-700">
                  {selectedActivity.rank}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-500">
                  Device ID #{selectedActivity.deviceId}
                </p>
                <p className="mt-4 text-xs text-slate-600">
                  {selectedActivity.sector
                    .toLowerCase()
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </p>
                <p className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wide text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  {selectedActivity.activity}
                </p>
              </aside>

              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded bg-white/90 px-3 py-2 font-mono text-[15px] text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Last place device was open  6:17:07
              </div>
            </div>
          </section>
        ) : (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-4 md:p-5">
          {/* Search and filters */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="relative w-full sm:max-w-md">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by device, enforcer, location..."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange-400"
              />
            </div>

            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-36"
              aria-label="Filter activity by type"
            >
              <option>All Activity</option>
              <option>Roadside Apprehension</option>
              <option>Device Shut Down</option>
              <option>Backup Call</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-auto"
              aria-label="Filter activity by date"
            />
          </div>

          {/* Quick view sector filters */}
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="mr-2 text-xs font-semibold text-slate-600">
              Quick View
            </span>

            {sectors.map((sector) => (
              <button
                key={sector}
                type="button"
                onClick={() => setSelectedSector(sector)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  selectedSector === sector
                    ? "border-orange-400 bg-orange-50 text-orange-600"
                    : "border-slate-200 bg-white text-slate-600 hover:border-orange-300"
                }`}
              >
                {sector}
              </button>
            ))}

            <span className="ml-auto text-xs text-slate-400">
              Updated by 10:17:07 PM 10/17/26
            </span>
          </div>

          {/* Activity table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="bg-[#0F2744]/10">
                <tr className="border-b-2 border-slate-100 text-xs text-slate-500">
                  <th className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">Time</th>
                  <th className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">Device ID</th>
                  <th className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">Enforcer</th>
                  <th className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">Location</th>
                  <th className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">Activity</th>
                  <th className="px-3 py-4"></th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() =>
                      setSelectedLog((current) =>
                        current === log.id ? null : log.id
                      )
                    }
                    className={`cursor-pointer border-b border-slate-100 transition ${
                      selectedLog === log.id
                        ? "bg-orange-50"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <td
                      className={`px-3 py-4 text-center ${
                        selectedLog === log.id
                          ? "border-l-[6px] border-orange-500"
                          : "border-l-[6px] border-transparent"
                      }`}
                    >
                      <p className="text-sm font-medium">{log.time}</p>
                      <p className="mt-1 text-xs text-slate-400">{log.date}</p>
                    </td>

                    <td className="px-3 py-4 text-sm">{log.deviceId}</td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={Logo}
                          alt={log.enforcer}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                        <div>
                          <span className="block text-sm font-semibold text-black">
                            {log.enforcer}
                          </span>
                          <span className="text-sm font-semibold text-green-700">
                            {log.rank}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin size={21} className="shrink-0 text-slate-700" />
                        <div>
                          <p className="text-xs">{log.location}</p>
                          <p className="mt-1 text-xs text-slate-400">
                            {log.sector}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4 text-sm">{log.activity}</td>

                    <td className="px-3 py-4">
                      <ChevronRight
                        size={19}
                        className={`transition ${
                          selectedLog === log.id
                            ? "rotate-90 text-orange-500"
                            : "text-slate-700"
                        }`}
                      />
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No activity logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        )}
      </main>
    </div>
  );
}
