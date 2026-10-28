import { useState } from "react";
import { IdCard, FileText, Database } from "lucide-react";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "./ui/select";

const RESTRICTION_CODES = ["A", "A1", "B", "B1", "B2", "C", "D", "BE", "CE"];

const emptyForm = {
  licenseNumber: "",
  serialNumber: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  expirationDate: "",
  licenseClass: "Non-Professional",
  status: "Active",
  demeritPoints: "0",
  restrictionCodes: [],
  conditions: "",
  organDonor: false,
  nationality: "PHL",
  sex: "",
  weightKg: "",
  heightM: "",
  bloodType: "",
  eyeColor: "",
  agencyCode: "",
  address: "",
  emergencyName: "",
  emergencyAddress: "",
  emergencyPhone: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all";

const blankToNull = (value) => (typeof value === "string" ? value.trim() || null : value);

export default function LicenseModal({ isOpen, onClose, onSaved }) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const toggleCode = (code) =>
    setFormData((prev) => ({
      ...prev,
      restrictionCodes: prev.restrictionCodes.includes(code)
        ? prev.restrictionCodes.filter((c) => c !== code)
        : [...prev.restrictionCodes, code],
    }));

  const handleClose = () => {
    if (saving) return;
    setFormData(emptyForm);
    onClose();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("driver_licenses")
        .insert({
          license_number: formData.licenseNumber.trim().toUpperCase(),
          serial_number: blankToNull(formData.serialNumber.toUpperCase()),
          first_name: formData.firstName.trim(),
          middle_name: blankToNull(formData.middleName),
          last_name: formData.lastName.trim(),
          date_of_birth: formData.dateOfBirth,
          expiration_date: formData.expirationDate,
          license_class: formData.licenseClass,
          status: formData.status,
          demerit_points: Number(formData.demeritPoints) || 0,
          restriction_codes: formData.restrictionCodes,
          conditions: blankToNull(formData.conditions),
          organ_donor: formData.organDonor,
          nationality: blankToNull(formData.nationality) || "PHL",
          sex: formData.sex || null,
          weight_kg: formData.weightKg === "" ? null : Number(formData.weightKg),
          height_m: formData.heightM === "" ? null : Number(formData.heightM),
          blood_type: blankToNull(formData.bloodType),
          eye_color: blankToNull(formData.eyeColor),
          agency_code: blankToNull(formData.agencyCode),
          address: blankToNull(formData.address),
          emergency_contact_name: blankToNull(formData.emergencyName),
          emergency_contact_address: blankToNull(formData.emergencyAddress),
          emergency_contact_phone: blankToNull(formData.emergencyPhone),
        })
        .select()
        .single();

      if (error) {
        throw error.code === "23505"
          ? new Error("A license with this license or serial number already exists.")
          : error;
      }

      toast.success(`License ${data.license_number} added.`);
      setFormData(emptyForm);
      onSaved?.(data);
    } catch (error) {
      console.error("Error saving license:", error);
      toast.error(`Failed to save license: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white rounded-lg border border-slate-100 shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900">Add License</h2>
          <p className="text-sm text-slate-500 mt-1">
            Fields follow the printed driver&apos;s license card: the front, the back, then the record details the card does not show.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="profile-modal-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-2">
            <div className="space-y-6">
              {/* ===== Front ===== */}
              <Banner tag="FRONT" title="Driver's License" tone="blue" icon={<IdCard className="h-4 w-4" />} />

              <Section title="Driver">
                <Field label="Last Name">
                  <input name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} required />
                </Field>
                <Field label="First Name">
                  <input name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} required />
                </Field>
                <Field label="Middle Name">
                  <input name="middleName" value={formData.middleName} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Nationality">
                  <input name="nationality" value={formData.nationality} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Sex">
                  <PickList
                    value={formData.sex}
                    onChange={(value) => setField("sex", value)}
                    options={["M", "F"]}
                    placeholder="Select"
                  />
                </Field>
                <Field label="Date of Birth">
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClass} required />
                </Field>
                <Field label="Weight (kg)">
                  <input type="number" min="0" step="0.1" name="weightKg" value={formData.weightKg} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Height (m)">
                  <input type="number" min="0" max="2.99" step="0.01" name="heightM" value={formData.heightM} onChange={handleChange} placeholder="1.65" className={inputClass} />
                </Field>
                <Field label="Address" className="col-span-2">
                  <input name="address" value={formData.address} onChange={handleChange} className={inputClass} />
                </Field>
              </Section>

              <Section title="License">
                <Field label="License No." className="col-span-2">
                  <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="NCO-2024-123456" className={inputClass} required />
                </Field>
                <Field label="Expiration Date">
                  <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange} className={inputClass} required />
                </Field>
                <Field label="Agency Code">
                  <input name="agencyCode" value={formData.agencyCode} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Blood Type">
                  <input name="bloodType" value={formData.bloodType} onChange={handleChange} placeholder="O+" className={inputClass} />
                </Field>
                <Field label="Eye Color">
                  <input name="eyeColor" value={formData.eyeColor} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="License Class">
                  <PickList
                    value={formData.licenseClass}
                    onChange={(value) => setField("licenseClass", value)}
                    options={["Non-Professional", "Professional"]}
                  />
                </Field>
                <Field label="DL Codes (restrictions)" className="col-span-2">
                  <div className="flex flex-wrap gap-2">
                    {RESTRICTION_CODES.map((code) => {
                      const on = formData.restrictionCodes.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleCode(code)}
                          aria-pressed={on}
                          className={`cursor-pointer rounded-md border px-3 py-1 text-xs font-medium transition ${
                            on
                              ? "border-orange-500 bg-orange-50 text-orange-700"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-orange-300"
                          }`}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field label="Conditions" className="col-span-2">
                  <input name="conditions" value={formData.conditions} onChange={handleChange} placeholder="A: Wear corrective lenses" className={inputClass} />
                </Field>
              </Section>

              {/* ===== Back ===== */}
              <Banner tag="BACK" title="Back of the card" tone="green" icon={<FileText className="h-4 w-4" />} />

              <Section title="Card">
                <Field label="Serial No." className="col-span-2">
                  <input name="serialNumber" value={formData.serialNumber} onChange={handleChange} className={inputClass} />
                </Field>
              </Section>

              <Section title="Organ donation">
                <label className="col-span-2 flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formData.organDonor}
                    onChange={(e) => setField("organDonor", e.target.checked)}
                  />
                  I will donate my organs (leave unchecked for &quot;I will not donate any organ&quot;)
                </label>
              </Section>

              <Section title="In case of emergency">
                <Field label="Name">
                  <input name="emergencyName" value={formData.emergencyName} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Telephone No.">
                  <input name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Address" className="col-span-2">
                  <input name="emergencyAddress" value={formData.emergencyAddress} onChange={handleChange} className={inputClass} />
                </Field>
              </Section>

              {/* ===== Record ===== */}
              <Banner tag="RECORD" title="Not printed on the card" tone="slate" icon={<Database className="h-4 w-4" />} />

              <Section title="LTO record">
                <Field label="Demerit Points">
                  <input type="number" min="0" name="demeritPoints" value={formData.demeritPoints} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Record Status (Expired is worked out from the expiration date)" className="col-span-2">
                  <PickList
                    value={formData.status}
                    onChange={(value) => setField("status", value)}
                    options={["Active", "Suspended", "Revoked"]}
                  />
                </Field>
              </Section>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white shrink-0 flex flex-row justify-between gap-3 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="min-w-[100px]">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="min-w-[140px]">
              {saving ? "Saving..." : "Save License"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Labels each part of the form as the side of the card it belongs to
function Banner({ tag, title, tone, icon }) {
  const toneClass =
    tone === "green"
      ? "border-green-200 bg-green-50 text-green-800"
      : tone === "slate"
        ? "border-slate-200 bg-slate-100 text-slate-700"
        : "border-blue-200 bg-blue-50 text-blue-800";

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${toneClass}`}>
      <span className="flex items-center gap-1.5 rounded-md bg-white/70 px-2 py-1 text-xs font-bold tracking-wider">
        {icon}
        {tag}
      </span>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase">{title}</h3>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, className = "", children }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}

function PickList({ value, onChange, options, placeholder }) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="enforcers-select-trigger h-[38px] w-full rounded-xl px-3.5 py-2 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="enforcers-select-options select-slide-down bg-white">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
