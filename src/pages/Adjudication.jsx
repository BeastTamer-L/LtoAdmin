
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Play,
} from "lucide-react";
import SearchInput from "../components/SearchInput";
import FilterSelect from "../components/FilterSelect";
import DatePicker from "../components/DatePicker";

const today = new Date();
const todayKey = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0"),
].join("-");

const adjudicationRecords = [
  {
    id: 1,
    timestamp: "10:24 AM",
    date: "TODAY",
    dateKey: todayKey,
    plate: "M0967",
    driver: "Garfield Corda",
    violation: "DTS",
    activity: "Request Contest",
  },
  {
    id: 2,
    timestamp: "10:24 AM",
    date: "TODAY",
    dateKey: todayKey,
    plate: "M0967",
    driver: "Garfield Corda",
    violation: "DTS",
    activity: "Pending",
  },
  {
    id: 3,
    timestamp: "10:24 AM",
    date: "TODAY",
    dateKey: todayKey,
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
      <header className="bg-[#1E3A8A] px-5 py-4 text-white">
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
      <p className="mt-2 truncate text-sm font-semibold text-[#1E3A8A]">
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
  const [showAction, setShowAction] = useState(false);
  const [findings, setFindings] = useState(
    "Verified emergency vehicle presence in video at 00:05. Right-of-way granted."
  );
  const [resolution, setResolution] = useState("");
  const [rulingMessage, setRulingMessage] = useState("");
  const [savedRulings, setSavedRulings] = useState({});

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

    const matchesDate = !selectedDate || record.dateKey === selectedDate;

    return matchesSearch && matchesActivity && matchesDate;
  });

  if (selectedRecord && showAction) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#F0F4F8] text-slate-800">
        <main className="min-h-0 flex-1 overflow-auto px-5 py-6 md:px-8 md:py-7">
          <button
            type="button"
            onClick={() => {
              setSelectedRecord(null);
              setShowAction(false);
              setRulingMessage("");
            }}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={16} />
            Adjudication List
          </button>

          <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
            <header className="bg-[#1E3A8A] px-5 py-3 text-white">
              <h2 className="text-sm font-bold uppercase">
                PTSMD Adjudication Action
              </h2>
              <p className="text-xs text-slate-300">UOVR-2026-99182</p>
            </header>

            <div className="space-y-8 p-5 md:p-7">
              <div className="grid gap-3 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,2fr)]">
                <label
                  htmlFor="adjudicator-findings"
                  className="pt-1 text-xs font-semibold uppercase text-slate-500"
                >
                  Adjudicator Findings
                </label>
                <textarea
                  id="adjudicator-findings"
                  value={findings}
                  onChange={(event) => setFindings(event.target.value)}
                  rows={4}
                  className="w-full resize-y rounded-md border border-slate-200 bg-slate-100 p-4 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <fieldset>
                <legend className="mb-2 text-xs font-semibold uppercase text-slate-500">
                  Resolution
                </legend>
                <div className="space-y-2 pl-2 text-sm text-slate-700">
                  {[
                    "Dismiss Case (Clear Fine)",
                    "Uphold (Sustain Fine & Demerits)",
                    "Uphold & Elevate Escalation to LTO",
                  ].map((option) => (
                    <label key={option} className="flex w-fit items-center gap-2">
                      <input
                        type="radio"
                        name="adjudication-resolution"
                        value={option}
                        checked={resolution === option}
                        onChange={(event) => setResolution(event.target.value)}
                        className="accent-[#1E3A8A]"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </section>

          <div className="mt-4 flex flex-col items-end gap-2">
            {rulingMessage && (
              <p role="status" className="text-sm text-slate-600">
                {rulingMessage}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                if (!resolution) {
                  setRulingMessage("Select a resolution before saving the ruling.");
                  return;
                }
                setSavedRulings((current) => ({
                  ...current,
                  [selectedRecord]: { findings, resolution },
                }));
                setRulingMessage("Ruling saved.");
              }}
              className="rounded-md bg-[#1E3A8A] px-6 py-3 text-sm font-medium text-white hover:bg-[#2A4A9E]"
            >
              Save Ruling
            </button>
          </div>
        </main>
      </div>
    );
  }

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
                onClick={() => {
                  setShowAction(true);
                  const savedRuling = savedRulings[selectedRecord];
                  setFindings(
                    savedRuling?.findings ??
                      "Verified emergency vehicle presence in video at 00:05. Right-of-way granted."
                  );
                  setResolution(savedRuling?.resolution ?? "");
                  setRulingMessage("");
                }}
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
                              : "border-[#1E3A8A]"
                          }`}
                        >
                          <p className="text-xs font-bold text-[#1E3A8A]">
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
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          {/* Search and filters */}
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by plate, driver, violation..." />
              <FilterSelect value={activityFilter} onChange={setActivityFilter} options={activityOptions} aria-label="Filter adjudication by activity" />
              <DatePicker value={selectedDate} onChange={setSelectedDate} placeholder="Filter by date" triggerClassName="h-[38px] w-[170px] text-[14px]" aria-label="Filter adjudication by date" />
            </div>
          </div>

          {/* Adjudication table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#E7E9EC]">
                <tr>
                  <th className="whitespace-nowrap px-3 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Timestamp Captured
                  </th>
                  <th className="whitespace-nowrap px-3 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Plate #
                  </th>
                  <th className="whitespace-nowrap px-3 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Driver
                  </th>
                  <th className="whitespace-nowrap px-3 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Violation
                  </th>
                  <th className="whitespace-nowrap px-3 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                      onClick={() => {
                        setSelectedRecord(record.id);
                        setShowAction(false);
                        setRulingMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" ||
                          event.key === " "
                        ) {
                          event.preventDefault();
                          setSelectedRecord(record.id);
                          setShowAction(false);
                          setRulingMessage("");
                        }
                      }}
                      className={`cursor-pointer border-b border-slate-100 transition-colors ${
                        isSelected
                          ? "bg-orange-50"
                          : "bg-white hover:bg-orange-50/50"
                      }`}
                    >
                      <td
                        className={`border-l-[6px] px-3 py-4 ${
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

                      <td className="px-3 py-4 text-sm font-medium text-slate-800">
                        {record.plate}
                      </td>

                      <td className="px-3 py-4 text-sm font-medium text-slate-800">
                        {record.driver}
                      </td>

                      <td className="px-3 py-4 text-sm text-slate-800">
                        {record.violation}
                      </td>

                      <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-800">
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
