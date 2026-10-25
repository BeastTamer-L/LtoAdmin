
import { useEffect, useState } from "react";
import SearchInput from "../components/SearchInput";
import FilterSelect from "../components/FilterSelect";
import DatePicker from "../components/DatePicker";
import Modal from "../components/Modal";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "../components/ui/select";
import ViolationFullDetailsModal from "../components/ViolationFullDetailsModal";
import { TICKET_SELECT, toViolationRecord } from "../lib/violationRecords";
import { supabase } from "../supabaseClient";

const SETTLE_AFTER_DAYS = 15;

// Unsettled tickets first, settled ones last; within a status the newest stays first
const STATUS_ORDER = ["Unsettled", "Suspended", "Pending Contest", "Settled"];

const statusBadgeClasses = {
  Unsettled: "bg-blue-100 text-blue-800",
  Settled: "bg-green-100 text-green-800",
  Suspended: "bg-red-100 text-red-800",
  "Pending Contest": "bg-yellow-100 text-yellow-800",
};

// Matches the stored text ignoring case and extra spaces; a new ticket (or any other text) counts as unsettled
const ticketStatus = (ticket) => {
  const stored = String(ticket.ticket_status || "").trim().toLowerCase();
  return Object.keys(statusBadgeClasses).find((status) => status.toLowerCase() === stored) || "Unsettled";
};

// An unsettled ticket is suspended once it has gone 15 days without being settled
const isOverdue = (ticket) => {
  if (ticketStatus(ticket) !== "Unsettled" || !ticket.violation_date) return false;
  const [year, month, day] = ticket.violation_date.split("-").map(Number);
  const today = new Date();
  const days = Math.floor((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(year, month - 1, day)) / 86400000);
  return days >= SETTLE_AFTER_DAYS;
};

// Fine of a ticket: the first-offense fines of its violation types, added up
const ticketFine = (ticket, fineByName) =>
  (ticket.violations || []).reduce((total, name) => total + (Number(fineByName.get(name)) || 0), 0);

const peso = (value) => `₱ ${Number(value).toLocaleString("en-PH")}`;

const statusOptions = ["All", "Unsettled", "Settled", "Suspended", "Pending Contest"];
export default function Violations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [violationRecords, setViolationRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settleTarget, setSettleTarget] = useState(null);
  const [settling, setSettling] = useState(false);
  const [settleError, setSettleError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTickets = async () => {
      const [ticketsResult, typesResult] = await Promise.all([
        supabase
          .from("traffic_tickets")
          .select(TICKET_SELECT)
          .order("violation_date", { ascending: false })
          .order("violation_time", { ascending: false })
          .limit(500),
        supabase.from("violation_types").select('name, lto_code, fine:"1st_offense"'),
      ]);

      if (cancelled) return;

      if (ticketsResult.error || typesResult.error) {
        console.error("Failed to load violations:", ticketsResult.error || typesResult.error);
        setLoading(false);
        return;
      }

      const tickets = ticketsResult.data || [];

      // Unsettled for 15 days: suspend them
      const overdueIds = tickets.filter(isOverdue).map((ticket) => ticket.id);
      if (overdueIds.length > 0) {
        const { data: suspended, error: suspendError } = await supabase
          .from("traffic_tickets")
          .update({ ticket_status: "Suspended" })
          .in("id", overdueIds)
          .select("id");

        if (cancelled) return;
        if (suspendError) {
          console.error("Failed to suspend overdue tickets:", suspendError);
        } else {
          const suspendedIds = new Set((suspended || []).map((row) => row.id));
          tickets.forEach((ticket) => {
            if (suspendedIds.has(ticket.id)) ticket.ticket_status = "Suspended";
          });
        }
      }
      const ltoCodeByName = new Map((typesResult.data || []).map((type) => [type.name, type.lto_code]));
      const fineByName = new Map((typesResult.data || []).map((type) => [type.name, type.fine]));

      const enforcerIds = Array.from(new Set(tickets.map((ticket) => ticket.issued_by).filter(Boolean)));
      const profileById = new Map();
      if (enforcerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, middle_name, last_name")
          .in("id", enforcerIds);

        if (cancelled) return;
        (profiles || []).forEach((profile) => profileById.set(profile.id, profile));
      }

      setViolationRecords(
        tickets.map((ticket) => ({
          ...toViolationRecord(ticket, profileById.get(ticket.issued_by), ltoCodeByName),
          status: ticketStatus(ticket),
          fine: ticketFine(ticket, fineByName),
        }))
      );
      setLoading(false);
    };

    loadTickets();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeSettleModal = () => {
    if (settling) return;
    setSettleTarget(null);
    setSettleError("");
  };

  const confirmSettled = async () => {
    const target = settleTarget;
    if (!target || settling) return;

    setSettling(true);
    setSettleError("");

    const { data, error } = await supabase
      .from("traffic_tickets")
      .update({ ticket_status: "Settled" })
      .eq("id", target.id)
      .select("id");

    setSettling(false);
    if (error || !data || data.length === 0) {
      setSettleError(error?.message || "The ticket could not be updated.");
      return;
    }

    setViolationRecords((records) =>
      records.map((record) => (record.id === target.id ? { ...record, status: "Settled" } : record))
    );
    setSettleTarget(null);
  };

  const filteredRecords = violationRecords
    .filter((record) => {
    const matchesSearch = [
      record.uovrNo,
      record.date,
      record.time,
      record.enforcer,
      record.driver,
      record.plate,
      record.violations.join(" "),
      record.ltoCodes.join(" "),
      record.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || record.status === statusFilter;
    const matchesDate = !dateFilter || record.rawDate === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
  const selectedRecord = violationRecords.find(
    (record) => record.id === selectedViolation
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-100 text-slate-800">
      <main className="flex min-h-0 flex-1 p-4 md:p-6">
        <section className="flex min-h-0 flex-1 flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          {/* Search and status filter */}
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by ticket no...." />
              <FilterSelect value={statusFilter} onChange={setStatusFilter} options={statusOptions} aria-label="Filter violations by status" />
              <DatePicker value={dateFilter} onChange={setDateFilter} placeholder="Filter by date" triggerClassName="h-[38px] w-[170px] text-[14px]" aria-label="Filter violations by date" />
            </div>
          </div>

          {/* Violations table */}
          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[850px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#E7E9EC]">
                <tr>
                  {[
                    "UOVR No.",
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
                      className="whitespace-nowrap px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100" aria-busy={loading}>
                {loading ? (
                  Array.from({ length: 8 }, (_, rowIndex) => (
                    <tr key={`skeleton-${rowIndex}`}>
                      {Array.from({ length: 9 }, (_, columnIndex) => (
                        <td key={columnIndex} className="px-6 py-4">
                          <div
                            className={`h-4 animate-pulse rounded bg-slate-200/80 ${
                              ["w-24", "w-32", "w-20", "w-28", "w-16", "w-36"][(rowIndex + columnIndex) % 6]
                            }`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() => setSelectedViolation(record.id)}
                      className="cursor-pointer transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedViolation(record.id);
                        }
                      }}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-[#1E3A8A]">{record.uovrNo}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{record.date}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{record.time}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{record.enforcer}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{record.driver}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{record.plate}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {record.ltoCodes.length === 0 ? (
                          "—"
                        ) : (
                          <span title={record.violations.join(", ")}>
                            {record.ltoCodes[0]}
                            {record.ltoCodes.length > 1 && (
                              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                +{record.ltoCodes.length - 1}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{peso(record.fine)}</td>
                      <td
                        className="whitespace-nowrap px-6 py-4 text-sm text-gray-700"
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                      >
                        {/* Only a suspended or unsettled ticket can be marked settled */}
                        <Select
                          value={record.status}
                          onValueChange={(value) => {
                            if (value === "Settled") setSettleTarget(record);
                          }}
                          disabled={!["Unsettled", "Suspended"].includes(record.status)}
                        >
                          <SelectTrigger
                            aria-label={`Status of ${record.uovrNo}`}
                            className={`h-auto w-auto cursor-pointer gap-1.5 rounded-full border-0 px-2.5 py-0.5 text-xs font-medium shadow-none outline-none ring-0 ring-offset-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-default disabled:opacity-100 ${statusBadgeClasses[record.status]}`}
                          >
                            <SelectValue>{record.status}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="enforcers-select-options select-slide-down bg-white">
                            {/* Suspended and Pending Contest are set by the system, so they are not offered */}
                            {(record.status === "Unsettled" ? ["Unsettled", "Settled"] : ["Settled"]).map((status) => (
                              <SelectItem key={status} value={status} className="cursor-pointer data-[disabled]:cursor-default">
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                      No violation records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
      </main>

      <Modal
        isOpen={Boolean(settleTarget)}
        onClose={closeSettleModal}
        onConfirm={confirmSettled}
        title="Settle ticket?"
        description={
          settleError
            ? `Failed to update the ticket: ${settleError}`
            : `Are you sure that this ticket${settleTarget ? ` (${settleTarget.uovrNo})` : ""} is settled?`
        }
        confirmText="Yes, it's settled"
        color="#16A34A"
        loading={settling}
      />

      {selectedRecord && (
        <ViolationFullDetailsModal record={selectedRecord} onClose={() => setSelectedViolation(null)} />
      )}
    </div>
  );
}
