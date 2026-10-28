import { supabase } from "../supabaseClient";

export const TICKET_SELECT =
  "id, uovr_number, issued_by, ticket_status, officer_signature_data, driver_signature_data, driver_full_name, driver_date_of_birth, driver_license_no, plate_no, vehicle_type, vehicle_status, violation_location, violation_date, violation_time, violations, license_confiscated, plate_confiscated, towed, impounded, vehicle_image_uri, pi_video_on_device, pi_video_status, pi_video_path, pi_transcript_status, pi_transcript";

// A ticket has no status column, so it is derived from what happened at the stop
export const deriveStatus = (ticket) => {
  if (ticket.impounded) return "Impounded";
  if (ticket.towed) return "Towed";
  if (ticket.license_confiscated || ticket.plate_confiscated) return "Confiscated";
  return "Ticket";
};

export const formatDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const formatTime = (value) => {
  if (!value) return "—";
  const [hours, minutes] = value.split(":").map(Number);
  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export const shortName = (profile) => {
  if (!profile) return "—";
  const initials = (profile.first_name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
  return initials && profile.last_name
    ? `${initials}. ${profile.last_name}`
    : `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "—";
};

export const fullName = (profile) =>
  profile ? [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ") || "—" : "—";

export const clean = (value) => (value && value !== "N/A" ? value : null);

export const formatClock = (seconds) => {
  const total = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

// Turns a traffic_tickets row (plus its enforcer profile and the LTO codes by violation name) into the record the violation views use
export const toViolationRecord = (ticket, profile, ltoCodeByName) => {
  const violations = ticket.violations || [];
  const actions = [
    ticket.license_confiscated && "License confiscated",
    ticket.plate_confiscated && "Plate confiscated",
    ticket.towed && "Towed",
    ticket.impounded && "Impounded",
  ].filter(Boolean);

  return {
    id: ticket.id,
    uovrNo: ticket.uovr_number,
    rawDate: ticket.violation_date,
    date: formatDate(ticket.violation_date),
    time: formatTime(ticket.violation_time),
    enforcer: shortName(profile),
    enforcerName: fullName(profile),
    driver: ticket.driver_full_name || "—",
    plate: clean(ticket.plate_no) || "—",
    violations,
    ltoCodes: violations.map((name) => ltoCodeByName.get(name)).filter(Boolean),
    status: deriveStatus(ticket),
    licenseNumber: clean(ticket.driver_license_no),
    dateOfBirth: ticket.driver_date_of_birth ? formatDate(ticket.driver_date_of_birth) : null,
    vehicleType: clean(ticket.vehicle_type),
    vehicleStatus: clean(ticket.vehicle_status),
    location: clean(ticket.violation_location),
    actions,
    officerSignature: ticket.officer_signature_data,
    driverSignature: ticket.driver_signature_data,
    imageUri: ticket.vehicle_image_uri,
    videoOnDevice: ticket.pi_video_on_device,
    videoStatus: ticket.pi_video_status,
    // storage path in the private ticket-files bucket, only once the CAMote has finished uploading it
    videoPath: ticket.pi_video_status === "uploaded" ? ticket.pi_video_path : null,
    // transcription confidence / phonetic fixes, worked out on the CAMote after the session (null on older tickets)
    transcriptQuality: ticket.pi_transcript?.quality || null,
    transcriptStatus: ticket.pi_transcript_status,
    transcriptLines: (ticket.pi_transcript?.lines || []).filter((line) => line.in_case !== false && line.text),
  };
};

// Loads one ticket as a full violation record (null if it cannot be found)
export const loadViolationRecord = async (ticketId) => {
  const [ticketResult, typesResult] = await Promise.all([
    supabase.from("traffic_tickets").select(TICKET_SELECT).eq("id", ticketId).maybeSingle(),
    supabase.from("violation_types").select("name, lto_code"),
  ]);

  const error = ticketResult.error || typesResult.error;
  if (error) throw error;
  if (!ticketResult.data) return null;

  let profile = null;
  if (ticketResult.data.issued_by) {
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, middle_name, last_name")
      .eq("id", ticketResult.data.issued_by)
      .maybeSingle();
    if (profileError) throw profileError;
    profile = data;
  }

  const ltoCodeByName = new Map((typesResult.data || []).map((type) => [type.name, type.lto_code]));
  return toViolationRecord(ticketResult.data, profile, ltoCodeByName);
};
