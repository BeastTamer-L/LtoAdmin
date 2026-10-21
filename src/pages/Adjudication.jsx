
import { useState } from "react";
import {
  Search,
  CalendarClock,
  Filter,
  ArrowLeft,
  ArrowRight,
  Play,
} from "lucide-react";

const adjudicationRecords = [
  {
    id: 1,
    timestamp: "10:24 AM",
    date: "TODAY",
    plate: "M0967",
    driver: "Garfield Corda",
    violation: "DTS",
    activity: "Request Contest",
  },
  {
    id: 2,
    timestamp: "10:24 AM",
    date: "TODAY",
    plate: "M0967",
    driver: "Garfield Corda",
    violation: "DTS",
    activity: "Pending",
  },
  {
    id: 3,
    timestamp: "10:24 AM",
    date: "TODAY",
    plate: "S0967",
    driver: "Garfield Corda",
    violation: "DTS",
    activity: "LTO Escalated",
  },
];

const activityOptions = [
  "All Activity",
  "Request Contest",
  "Pending",
  "LTO Escalated",
];

function DetailCard({ title, subtitle, children, className = "" }) {
  return (
    <section
      className={`overflow-hidden rounded-md border border-slate-200 bg-white ${className}`}
    >
      <header className="bg-[#102D4A] px-5 py-4 text-white">
        <h2 className="text-sm font-bold uppercase">{title}</h2>
        <p className="mt-1 text-xs text-slate-300">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

function VideoPlaceholder({ label, className = "" }) {
  return (
    <div className={`border border-slate-200 bg-white p-2 ${className}`}>
      <div className="flex aspect-video items-center justify-center border border-slate-200 bg-slate-100">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white">
          <Play size={24} fill="currentColor" />
        </span>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-[#102D4A]">
        {label}
      </p>
    </div>
  );
}

export default function Adjudication() {
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState("All Activity");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  const filteredRecords = adjudicationRecords.filter((record) => {
    const searchText = [
      record.plate,
      record.driver,
      record.violation,
      record.activity,
      record.timestamp,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesActivity =
      activityFilter === "All Activity" ||
      record.activity === activityFilter;

    // sample records
    const matchesDate = !selectedDate || record.date === selectedDate;

    return matchesSearch && matchesActivity && matchesDate;
  });

  if (selectedRecord) {
    const caseFields = [
      ["Full Name", "Ghim Joseph Villa"],
      ["Driver's License Number", "N03-20-123456"],
      ["Contact Number", "09170988797"],
      ["Address", "Blk 9, brgy 173"],
      ["Grounds for Contest", "Avoided an ambulance to give way"],
    ];
    const citationFields = [
      ["Ordinance / Law", "City Ord. No. 0422 (Red Light)"],
      ["Date and Time", "Oct 15, 2026 14:22:05 PST"],
      ["Traffic Enforcer", "Adrian Dimla Morte"],
      ["Original Penalty", "₱3,000.00"],
      ["Demerit Pts", "+ 2 Points"],
    ];
    const transcript = [
      ["Enforcer", "Over speeding ka boss", "4:10 PM"],
      ["Driver", "GE BOSS GE GE", "4:10 PM"],
      ["Enforcer", "Over speeding ka boss", "4:10 PM"],
      ["Driver", "GE BOSS GE GE", "4:10 PM"],
    ];

    return (
      <div className="flex h-full min-h-0 flex-col bg-[#F0F4F8] text-slate-800">
        <main className="min-h-0 flex-1 overflow-auto px-5 py-6 md:px-8 md:py-7">
          <div className="w-full">
            <nav className="mb-6 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft size={16} />
                Adjudication List
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800"
              >
                Adjudication Action
                <ArrowRight size={16} />
              </button>
            </nav>

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
              <DetailCard title="Contester Details" subtitle="CASE ID: 938294728">
                <dl className="space-y-3 p-5 text-sm">
                  {caseFields.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[minmax(150px,auto)_1fr] gap-3"
                    >
                      <dt className="text-xs font-medium uppercase text-slate-500">
                        {label}
                      </dt>
                      <dd className="font-medium text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="px-5 pb-5">
                  <p className="mb-3 text-xs font-medium uppercase text-slate-500">
                    Attached Proof
                  </p>
                  <VideoPlaceholder
                    label="Dashcam Video.mp4"
                    className="max-w-md"
                  />
                </div>
              </DetailCard>

              <DetailCard
                title="Violation Citation Details"
                subtitle="UOVR-2026-99182"
              >
                <dl className="space-y-3 p-5 text-sm">
                  {citationFields.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[minmax(140px,auto)_1fr] gap-3"
                    >
                      <dt className="text-xs font-medium uppercase text-slate-500">
                        {label}
                      </dt>
                      <dd className="font-medium text-slate-800">{value}</dd>
                    </div>
                  ))}
                </dl>
              </DetailCard>

              <DetailCard
                title="Apprehension Evidence"
                subtitle="UOVR-2026-99182"
                className="lg:col-span-2"
              >
                <div className="grid gap-6 p-5 md:grid-cols-2">
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase text-slate-500">
                      Video Apprehension
                    </p>
                    <VideoPlaceholder
                      label="Main Camera name jeiijif"
                      className="max-w-2xl"
                    />
                  </div>
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase text-slate-500">
                      Speech Transcription
                    </p>
                    <div className="space-y-2">
                      {transcript.map(([speaker, text, time], index) => (
                        <div
                          key={`${speaker}-${index}`}
                          className={`max-w-xl border-l-4 px-3 py-2 ${
                            speaker === "Enforcer"
                              ? "border-orange-500"
                              : "border-[#102D4A]"
                          }`}
                        >
                          <p className="text-xs font-bold text-[#102D4A]">
                            {speaker}
                          </p>
                          <div className="flex items-end justify-between gap-3">
                            <p className="text-sm text-slate-700">{text}</p>
                            <span className="shrink-0 text-[10px] text-slate-500">
                              {time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <p className="mb-3 text-xs font-medium uppercase text-slate-500">
                      Image Capture
                    </p>
                    <div className="grid max-w-xl grid-cols-2 gap-3">
                      <VideoPlaceholder label="Car Image 1" />
                      <VideoPlaceholder label="CR Image 1" />
                    </div>
                  </div>
                </div>
              </DetailCard>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">

      <main className="flex min-h-0 flex-1 p-4 md:p-6">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {/* Search and filters */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ticket no...."
                className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="relative md:w-40">
              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <select
                value={activityFilter}
                onChange={(event) =>
                  setActivityFilter(event.target.value)
                }
                className="w-full appearance-auto rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-orange-400"
              >
                {activityOptions.map((activity) => (
                  <option key={activity} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActivityFilter("All Activity");
                setSelectedDate("");
              }}
              className="flex items-center justify-center gap-2 rounded-md border border-slate-200 px-3 py-2.5 text-sm hover:bg-slate-50"
            >
              <CalendarClock size={16} />
              Date and Time
            </button>
          </div>

          {/* Adjudication table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-5 font-semibold">
                    Timestamp Captured
                  </th>
                  <th className="px-4 py-5 font-semibold">Plate #</th>
                  <th className="px-4 py-5 font-semibold">Driver</th>
                  <th className="px-4 py-5 font-semibold">Violation</th>
                  <th className="whitespace-nowrap px-4 py-5 font-semibold">
                    Activity
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const isSelected = selectedRecord === record.id;

                  return (
                    <tr
                      key={record.id}
                      tabIndex={0}
                      aria-selected={isSelected}
                      onClick={() =>
                        setSelectedRecord(record.id)
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          setSelectedRecord(record.id);
                        }
                      }}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        isSelected
                          ? "bg-orange-50"
                          : "bg-white hover:bg-orange-50/50"
                      }`}
                    >
                      <td
                        className={`border-l-[6px] px-4 py-6 ${
                          isSelected
                            ? "border-orange-500"
                            : "border-transparent"
                        }`}
                      >
                        <p className="text-sm font-medium text-slate-800">
                          {record.timestamp}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {record.date}
                        </p>
                      </td>

                      <td className="px-4 py-6 text-sm font-medium text-slate-800">
                        {record.plate}
                      </td>

                      <td className="px-4 py-6 text-sm font-medium text-slate-800">
                        {record.driver}
                      </td>

                      <td className="px-4 py-6 text-sm text-slate-800">
                        {record.violation}
                      </td>

                      <td className="whitespace-nowrap px-4 py-6 text-sm font-medium text-slate-800">
                        <span className="whitespace-nowrap">
                          {record.activity}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No adjudication records found.
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
