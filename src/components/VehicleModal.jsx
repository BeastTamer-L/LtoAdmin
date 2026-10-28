import { useState } from "react";
import { CarFront, Receipt } from "lucide-react";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "./ui/select";

const NO_OWNER = "__none__";

const emptyForm = {
  crNumber: "",
  plateNumber: "",
  mvFileNumber: "",
  make: "",
  series: "",
  bodyType: "",
  color: "",
  yearModel: "",
  fuelType: "",
  pistonDisplacement: "",
  numberOfCylinders: "",
  grossWeightKg: "",
  netWeightKg: "",
  netCapacityKg: "",
  classification: "Private",
  status: "Valid",
  engineNumber: "",
  chassisNumber: "",
  ownerName: "",
  ownerAddress: "",
  registeredAt: "",
  ownerLicenseNumber: NO_OWNER,
  tplInsurance: "",
  franchise: "",
  districtOffice: "",
  encumberedTo: "",
};

// The OR is optional here: it records the first payment together with the vehicle
const emptyReceipt = {
  addReceipt: false,
  orNumber: "",
  transactionType: "Initial Registration",
  paymentDate: "",
  payorName: "",
  registrationFee: "",
  plateFee: "",
  mvucFee: "",
  penaltyFee: "",
  otherFees: "",
  validFrom: "",
  validUntil: "",
};

const FEE_FIELDS = [
  ["registrationFee", "Registration Fee"],
  ["plateFee", "Plate Fee"],
  ["mvucFee", "MVUC"],
  ["penaltyFee", "Penalty / Surcharge"],
  ["otherFees", "Other Fees"],
];

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const amount = (value) => (value === "" ? 0 : Number(value));

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all";

const blankToNull = (value) => value.trim() || null;
const numberOrNull = (value) => (value === "" ? null : Number(value));

// licenses: [{ licenseNumber, fullName }] the vehicle can be linked to
export default function VehicleModal({ isOpen, onClose, onSaved, licenses }) {
  const [formData, setFormData] = useState(emptyForm);
  const [receiptData, setReceiptData] = useState(emptyReceipt);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));

  const handleReceiptChange = (e) => {
    const { name, value } = e.target;
    setReceiptData((prev) => ({ ...prev, [name]: value }));
  };

  const receiptTotal = FEE_FIELDS.reduce((sum, [name]) => sum + amount(receiptData[name]), 0);

  const handleClose = () => {
    if (saving) return;
    setFormData(emptyForm);
    setReceiptData(emptyReceipt);
    onClose();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("registered_vehicles")
        .insert({
          cr_number: blankToNull(formData.crNumber.toUpperCase()),
          plate_number: formData.plateNumber.trim().toUpperCase(),
          mv_file_number: formData.mvFileNumber.trim().toUpperCase(),
          make: formData.make.trim(),
          series: blankToNull(formData.series),
          body_type: blankToNull(formData.bodyType),
          color: blankToNull(formData.color),
          year_model: numberOrNull(formData.yearModel),
          fuel_type: formData.fuelType || null,
          piston_displacement: numberOrNull(formData.pistonDisplacement),
          number_of_cylinders: numberOrNull(formData.numberOfCylinders),
          gross_weight_kg: numberOrNull(formData.grossWeightKg),
          net_weight_kg: numberOrNull(formData.netWeightKg),
          net_capacity_kg: numberOrNull(formData.netCapacityKg),
          owner_name: formData.ownerName.trim(),
          owner_address: blankToNull(formData.ownerAddress),
          classification: formData.classification,
          status: formData.status,
          engine_number: blankToNull(formData.engineNumber),
          chassis_number: blankToNull(formData.chassisNumber),
          // Left out when blank so the column default (today) applies
          ...(formData.registeredAt && { registered_at: formData.registeredAt }),
          owner_license_number: formData.ownerLicenseNumber === NO_OWNER ? null : formData.ownerLicenseNumber,
          tpl_insurance: blankToNull(formData.tplInsurance),
          franchise: blankToNull(formData.franchise),
          lto_district_office: blankToNull(formData.districtOffice),
          encumbered_to: blankToNull(formData.encumberedTo),
        })
        .select()
        .single();

      if (error) {
        throw error.code === "23505"
          ? new Error("A vehicle with this CR, plate or MV file number already exists.")
          : error;
      }

      let receipt = null;
      if (receiptData.addReceipt) {
        const { data: receiptRow, error: receiptError } = await supabase
          .from("vehicle_official_receipts")
          .insert({
            vehicle_id: data.id,
            or_number: receiptData.orNumber.trim().toUpperCase(),
            transaction_type: receiptData.transactionType,
            payment_date: receiptData.paymentDate || today(),
            payor_name: receiptData.payorName.trim() || formData.ownerName.trim(),
            registration_fee: amount(receiptData.registrationFee),
            plate_fee: amount(receiptData.plateFee),
            mvuc_fee: amount(receiptData.mvucFee),
            penalty_fee: amount(receiptData.penaltyFee),
            other_fees: amount(receiptData.otherFees),
            valid_from: receiptData.validFrom || formData.registeredAt || today(),
            valid_until: receiptData.validUntil,
          })
          .select()
          .single();

        if (receiptError) {
          // The CR is already saved, so keep it and tell the user the OR still has to be added
          toast.error(`Vehicle ${data.plate_number} saved, but its OR was not: ${receiptError.message}`);
          setFormData(emptyForm);
          setReceiptData(emptyReceipt);
          onSaved?.(data, null);
          return;
        }
        receipt = receiptRow;
      }

      toast.success(`Vehicle ${data.plate_number} added${receipt ? ` with OR ${receipt.or_number}` : ""}.`);
      setFormData(emptyForm);
      setReceiptData(emptyReceipt);
      onSaved?.(data, receipt);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error(`Failed to save vehicle: ${error.message}`);
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
          <h2 className="text-xl font-semibold text-slate-900">Add Vehicle</h2>
          <p className="text-sm text-slate-500 mt-1">
            The Certificate of Registration (CR) describes the vehicle. The Official Receipt (OR) is its payment, and is optional here.
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="profile-modal-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-2">
            <div className="space-y-6">
              {/* ===== CR ===== */}
              <DocumentBanner tag="CR" title="Certificate of Registration" tone="blue" icon={<CarFront className="h-4 w-4" />} />

              <Section title="Vehicle identification">
                <Field label="CR Number">
                  <input name="crNumber" value={formData.crNumber} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="MV File Number">
                  <input name="mvFileNumber" value={formData.mvFileNumber} onChange={handleChange} placeholder="NCO-1301-0000984293" className={inputClass} required />
                </Field>
                <Field label="Plate Number">
                  <input name="plateNumber" value={formData.plateNumber} onChange={handleChange} placeholder="ABC 1234" className={inputClass} required />
                </Field>
                <Field label="Classification">
                  <PickList
                    value={formData.classification}
                    onChange={(value) => setField("classification", value)}
                    options={["Private", "For Hire", "Government", "Diplomatic"]}
                  />
                </Field>
                <Field label="Make">
                  <input name="make" value={formData.make} onChange={handleChange} placeholder="Toyota" className={inputClass} required />
                </Field>
                <Field label="Series">
                  <input name="series" value={formData.series} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Body Type">
                  <input name="bodyType" value={formData.bodyType} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Year Model">
                  <input type="number" min="0" name="yearModel" value={formData.yearModel} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Color">
                  <input name="color" value={formData.color} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Fuel">
                  <PickList
                    value={formData.fuelType}
                    onChange={(value) => setField("fuelType", value)}
                    options={["Gasoline", "Diesel", "LPG", "Electric", "Hybrid"]}
                    placeholder="Select"
                  />
                </Field>
                <Field label="Engine Number">
                  <input name="engineNumber" value={formData.engineNumber} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Chassis / VIN">
                  <input name="chassisNumber" value={formData.chassisNumber} onChange={handleChange} className={inputClass} />
                </Field>
              </Section>

              <Section title="Specifications">
                <Field label="Piston Displacement (cc)">
                  <input type="number" min="0" name="pistonDisplacement" value={formData.pistonDisplacement} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="No. of Cylinders">
                  <input type="number" min="0" name="numberOfCylinders" value={formData.numberOfCylinders} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Gross Weight (kg)">
                  <input type="number" min="0" step="0.1" name="grossWeightKg" value={formData.grossWeightKg} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Net Weight (kg)">
                  <input type="number" min="0" step="0.1" name="netWeightKg" value={formData.netWeightKg} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Net Capacity (kg)">
                  <input type="number" min="0" step="0.1" name="netCapacityKg" value={formData.netCapacityKg} onChange={handleChange} className={inputClass} />
                </Field>
              </Section>

              <Section title="Registered owner">
                <Field label="Name" className="col-span-2">
                  <input name="ownerName" value={formData.ownerName} onChange={handleChange} className={inputClass} required />
                </Field>
                <Field label="Address" className="col-span-2">
                  <input name="ownerAddress" value={formData.ownerAddress} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Owner License (optional link)" className="col-span-2">
                  <PickList
                    value={formData.ownerLicenseNumber}
                    onChange={(value) => setField("ownerLicenseNumber", value)}
                    options={[
                      { value: NO_OWNER, label: "No owner linked" },
                      ...licenses.map((license) => ({
                        value: license.licenseNumber,
                        label: `${license.licenseNumber} — ${license.fullName}`,
                      })),
                    ]}
                  />
                </Field>
              </Section>

              <Section title="Registration details">
                <Field label="Date Registered">
                  <input type="date" name="registeredAt" value={formData.registeredAt} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="LTO District Office">
                  <input name="districtOffice" value={formData.districtOffice} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Encumbered To">
                  <input name="encumberedTo" value={formData.encumberedTo} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Franchise">
                  <input name="franchise" value={formData.franchise} onChange={handleChange} placeholder="N/A (Private)" className={inputClass} />
                </Field>
                <Field label="TPL Insurance (not on the CR)">
                  <input name="tplInsurance" value={formData.tplInsurance} onChange={handleChange} placeholder="PGA Ins Corp" className={inputClass} />
                </Field>
                <Field label="Record Status (system flag)">
                  <PickList
                    value={formData.status}
                    onChange={(value) => setField("status", value)}
                    options={["Valid", "Suspended"]}
                  />
                </Field>
              </Section>

              {/* ===== OR ===== */}
              <DocumentBanner tag="OR" title="Official Receipt" tone="green" icon={<Receipt className="h-4 w-4" />} />

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={receiptData.addReceipt}
                  onChange={(e) => setReceiptData((prev) => ({ ...prev, addReceipt: e.target.checked }))}
                />
                Record the first Official Receipt now
              </label>
              {!receiptData.addReceipt && (
                <p className="-mt-3 text-xs text-slate-500">
                  Skip this to add the vehicle with no OR. Add ORs later from the vehicle record. Until one is on file the vehicle shows as expired.
                </p>
              )}

              {receiptData.addReceipt && (
                <>
                  <Section title="Receipt details">
                    <Field label="OR Number">
                      <input name="orNumber" value={receiptData.orNumber} onChange={handleReceiptChange} className={inputClass} required />
                    </Field>
                    <Field label="Transaction">
                      <PickList
                        value={receiptData.transactionType}
                        onChange={(value) => setReceiptData((prev) => ({ ...prev, transactionType: value }))}
                        options={["Initial Registration", "Renewal", "Transfer of Ownership", "Replacement"]}
                      />
                    </Field>
                    <Field label="Payment Date">
                      <input type="date" name="paymentDate" value={receiptData.paymentDate} onChange={handleReceiptChange} className={inputClass} />
                    </Field>
                    <Field label="Payor (defaults to the owner)">
                      <input name="payorName" value={receiptData.payorName} onChange={handleReceiptChange} className={inputClass} />
                    </Field>
                    <Field label="Valid From (defaults to date registered)">
                      <input type="date" name="validFrom" value={receiptData.validFrom} onChange={handleReceiptChange} className={inputClass} />
                    </Field>
                    <Field label="Valid Until">
                      <input type="date" name="validUntil" value={receiptData.validUntil} onChange={handleReceiptChange} className={inputClass} required />
                    </Field>
                  </Section>

                  <Section title="Fees (₱)">
                  <Field label="Registration Fee">
                    <input type="number" min="0" step="0.01" name="registrationFee" value={receiptData.registrationFee} onChange={handleReceiptChange} className={inputClass} />
                  </Field>
                  <Field label="Plate Fee">
                    <input type="number" min="0" step="0.01" name="plateFee" value={receiptData.plateFee} onChange={handleReceiptChange} className={inputClass} />
                  </Field>
                  <Field label="MVUC">
                    <input type="number" min="0" step="0.01" name="mvucFee" value={receiptData.mvucFee} onChange={handleReceiptChange} className={inputClass} />
                  </Field>
                  <Field label="Penalty / Surcharge">
                    <input type="number" min="0" step="0.01" name="penaltyFee" value={receiptData.penaltyFee} onChange={handleReceiptChange} className={inputClass} />
                  </Field>
                  <Field label="Other Fees">
                    <input type="number" min="0" step="0.01" name="otherFees" value={receiptData.otherFees} onChange={handleReceiptChange} className={inputClass} />
                  </Field>
                    <div className="flex items-end justify-between rounded-xl bg-slate-100 px-3.5 py-2 text-sm">
                      <span className="text-slate-500">Total</span>
                      <span className="font-semibold text-slate-800">
                        ₱{receiptTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </Section>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-white shrink-0 flex flex-row justify-between gap-3 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="min-w-[100px]">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="min-w-[140px]">
              {saving ? "Saving..." : "Save Vehicle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Labels each half of the form as the document it belongs to
function DocumentBanner({ tag, title, tone, icon }) {
  const toneClass =
    tone === "green" ? "border-green-200 bg-green-50 text-green-800" : "border-blue-200 bg-blue-50 text-blue-800";

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

// options are plain strings, or { value, label } when the shown text differs
function PickList({ value, onChange, options, placeholder }) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className="enforcers-select-trigger h-[38px] w-full rounded-xl px-3.5 py-2 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="enforcers-select-options select-slide-down bg-white">
        {options.map((option) => {
          const { value: optionValue, label } = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <SelectItem key={optionValue} value={optionValue}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
