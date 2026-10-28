import { supabase } from "../supabaseClient";
import { TICKET_SELECT, clean, toViolationRecord } from "./violationRecords";

const longDate = (value) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const riskLabel = (points) => (points < 10 ? "Low Risk" : points < 20 ? "Moderate Risk" : "High Risk");

export const isPastDate = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day) < new Date(new Date().setHours(0, 0, 0, 0));
};

// Turns a driver_licenses row into the record the license and vehicle pages render
export const toDriver = (row) => ({
  id: row.id,
  // The card prints the name as LAST, First Middle
  fullName: `${row.last_name}, ${[row.first_name, row.middle_name].filter(Boolean).join(" ")}`,
  lastName: row.last_name,
  firstName: row.first_name,
  middleName: row.middle_name || "—",
  serialNumber: row.serial_number || "—",
  licenseNumber: row.license_number,
  dateOfBirth: longDate(row.date_of_birth),
  expiration: longDate(row.expiration_date),
  licenseClass: row.license_class,
  status: row.status !== "Active" ? row.status : isPastDate(row.expiration_date) ? "Expired" : "Valid - Active",
  points: `${String(row.demerit_points).padStart(2, "0")} / 40 (${riskLabel(row.demerit_points)})`,
  address: row.address || "—",
  restrictionCodes: (row.restriction_codes || []).join(", ") || "—",
  conditions: row.conditions || "None",
  organDonor: row.organ_donor,
  nationality: row.nationality || "—",
  sex: row.sex || "—",
  weight: row.weight_kg ?? "—",
  height: row.height_m ?? "—",
  bloodType: row.blood_type || "—",
  eyeColor: row.eye_color || "—",
  agencyCode: row.agency_code || "—",
  emergencyName: row.emergency_contact_name || "—",
  emergencyAddress: row.emergency_contact_address || "—",
  emergencyPhone: row.emergency_contact_phone || "—",
});

// No OR on file means no paid registration, so it reads as expired
const vehicleStatus = (flag, expiry) =>
  flag !== "Valid" ? flag.toUpperCase() : !expiry || isPastDate(expiry) ? "EXPIRED" : "VALID";

// A new OR can extend the registration without reloading the vehicle
export const withExpiry = (vehicle, expiry) => ({
  ...vehicle,
  registrationExpiry: expiry,
  status: vehicleStatus(vehicle.registrationFlag, expiry),
});

// Turns a registered_vehicles row into the record the vehicle views render
export const toVehicle = (row) => ({
  id: row.id,
  plate: row.plate_number,
  name: [row.make, row.series].filter(Boolean).join(" "),
  make: row.make,
  series: row.series || "—",
  crNumber: row.cr_number || "—",
  bodyType: row.body_type || "—",
  fuelType: row.fuel_type || "—",
  pistonDisplacement: row.piston_displacement ?? "—",
  cylinders: row.number_of_cylinders ?? "—",
  grossWeight: row.gross_weight_kg ?? "—",
  netWeight: row.net_weight_kg ?? "—",
  netCapacity: row.net_capacity_kg ?? "—",
  ownerName: row.owner_name,
  ownerAddress: row.owner_address || "—",
  color: row.color || "—",
  year: row.year_model ?? "—",
  registrationFlag: row.status,
  status: vehicleStatus(row.status, row.registration_expiry),
  classification: row.classification,
  registeredAt: row.registered_at,
  registrationExpiry: row.registration_expiry,
  engine: row.engine_number || "—",
  mvFile: row.mv_file_number,
  chassis: row.chassis_number || "—",
  ownerLicenseNumber: row.owner_license_number,
  insurance: row.tpl_insurance || "None on file",
  franchise: row.franchise || "N/A",
  districtOffice: row.lto_district_office || "—",
  encumberedTo: row.encumbered_to || "None",
});

// Turns a vehicle_official_receipts row into the record the OR list renders
export const toReceipt = (row) => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  orNumber: row.or_number,
  transactionType: row.transaction_type,
  paymentDate: row.payment_date,
  payorName: row.payor_name,
  registrationFee: Number(row.registration_fee),
  plateFee: Number(row.plate_fee),
  mvucFee: Number(row.mvuc_fee),
  penaltyFee: Number(row.penalty_fee),
  otherFees: Number(row.other_fees),
  total: Number(row.total_amount),
  validFrom: row.valid_from,
  validUntil: row.valid_until,
});

// ------------------------------------------------------------------------------------------------ citation history

// License and plate numbers are compared on letters and digits only: "N01-23-456789", "n01 23 456789" and "N0123456789" are one license
export const normalizeId = (value) => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// ilike pattern that finds a stored number however it was typed (dashes, spaces); the exact match is checked after
// (inside .or() PostgREST takes * for %)
const looseLike = (id, wildcard = "%") => id.split("").join(wildcard);

const CITATION_STATUSES = ["Unsettled", "Settled", "Suspended", "Pending Contest"];
const citationStatus = (ticket) => {
  const stored = String(ticket.ticket_status || "").trim().toLowerCase();
  return CITATION_STATUSES.find((status) => status.toLowerCase() === stored) || "Unsettled";
};

const peso = (value) => `₱${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

const videoLabel = (ticket) =>
  ticket.pi_video_status === "uploaded"
    ? "Uploaded"
    : ticket.pi_video_status === "failed"
      ? "Upload failed (kept on the CAMote)"
      : ticket.pi_video_on_device || ticket.pi_video_status
        ? "On the CAMote device"
        : "No video";

// Tickets filed in the app whose driver license number matches this license, newest first, each with its vehicle
// (the registered vehicle with the ticket's plate, else what the enforcer wrote on the ticket)
export const loadCitationHistory = async (licenseNumber) => {
  const id = normalizeId(licenseNumber);
  if (!id) return [];

  const [ticketsResult, typesResult] = await Promise.all([
    supabase
      .from("traffic_tickets")
      .select(`${TICKET_SELECT}, pi_session_id`)
      .ilike("driver_license_no", looseLike(id))
      .order("violation_date", { ascending: false })
      .order("violation_time", { ascending: false })
      .limit(200),
    supabase.from("violation_types").select('name, lto_code, fine:"1st_offense"'),
  ]);
  if (ticketsResult.error) throw ticketsResult.error;
  if (typesResult.error) throw typesResult.error;

  const tickets = (ticketsResult.data || []).filter((ticket) => normalizeId(ticket.driver_license_no) === id);
  if (tickets.length === 0) return [];

  const plates = Array.from(new Set(tickets.map((ticket) => normalizeId(clean(ticket.plate_no))).filter(Boolean)));
  const enforcerIds = Array.from(new Set(tickets.map((ticket) => ticket.issued_by).filter(Boolean)));
  const [vehiclesResult, profilesResult] = await Promise.all([
    plates.length
      ? supabase.from("registered_vehicles").select("*").or(plates.map((plate) => `plate_number.ilike.${looseLike(plate, "*")}`).join(","))
      : Promise.resolve({ data: [] }),
    enforcerIds.length
      ? supabase.from("profiles").select("id, first_name, middle_name, last_name").in("id", enforcerIds)
      : Promise.resolve({ data: [] }),
  ]);
  // the history still shows without the vehicle details or the enforcer names
  if (vehiclesResult.error) console.error("Failed to load the cited vehicles:", vehiclesResult.error);
  if (profilesResult.error) console.error("Failed to load the enforcers:", profilesResult.error);

  const vehicleByPlate = new Map((vehiclesResult.data || []).map((row) => [normalizeId(row.plate_number), toVehicle(row)]));
  const profileById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
  const ltoCodeByName = new Map((typesResult.data || []).map((type) => [type.name, type.lto_code]));
  const fineByName = new Map((typesResult.data || []).map((type) => [type.name, type.fine]));

  return tickets.map((ticket) => {
    const record = toViolationRecord(ticket, profileById.get(ticket.issued_by), ltoCodeByName);
    const registered = vehicleByPlate.get(normalizeId(record.plate));
    return {
      ...record,
      ticketNo: record.uovrNo || "—",
      type: ticket.pi_session_id ? "CAMote Enforcer Citation" : "Manual Enforcer Citation",
      offense: record.violations.join(", ") || "—",
      dateTime: `${record.date} ${record.time}`,
      penalty: peso(record.violations.reduce((total, name) => total + (Number(fineByName.get(name)) || 0), 0)),
      status: citationStatus(ticket),
      video: videoLabel(ticket),
      vehicle: registered || {
        plate: record.plate,
        name: record.vehicleType || "—",
        status: "NOT REGISTERED",
        color: "—",
        year: "—",
        classification: "—",
        engine: "—",
        mvFile: "—",
        chassis: "—",
      },
    };
  });
};
