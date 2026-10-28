import { useState } from "react";
import { Receipt } from "lucide-react";
import { supabase } from "../supabaseClient";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "./ui/select";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm px-3.5 py-2 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all";

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const buildForm = (vehicle) => ({
  orNumber: "",
  transactionType: "Renewal",
  paymentDate: today(),
  payorName: vehicle?.ownerName ?? "",
  registrationFee: "",
  plateFee: "",
  mvucFee: "",
  penaltyFee: "",
  otherFees: "",
  validFrom: vehicle?.registrationExpiry ?? today(),
  validUntil: "",
});

const amount = (value) => (value === "" ? 0 : Number(value));

// Records one registration payment (OR) against a vehicle that already has a CR
export default function ReceiptModal({ isOpen, onClose, onSaved, vehicle }) {
  const [formData, setFormData] = useState(() => buildForm(vehicle));
  const [saving, setSaving] = useState(false);

  // The form is rebuilt for whichever vehicle is picked
  const [forVehicleId, setForVehicleId] = useState(vehicle?.id);
  if (vehicle && vehicle.id !== forVehicleId) {
    setForVehicleId(vehicle.id);
    setFormData(buildForm(vehicle));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const total =
    amount(formData.registrationFee) +
    amount(formData.plateFee) +
    amount(formData.mvucFee) +
    amount(formData.penaltyFee) +
    amount(formData.otherFees);

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("vehicle_official_receipts")
        .insert({
          vehicle_id: vehicle.id,
          or_number: formData.orNumber.trim().toUpperCase(),
          transaction_type: formData.transactionType,
          payment_date: formData.paymentDate,
          payor_name: formData.payorName.trim(),
          registration_fee: amount(formData.registrationFee),
          plate_fee: amount(formData.plateFee),
          mvuc_fee: amount(formData.mvucFee),
          penalty_fee: amount(formData.penaltyFee),
          other_fees: amount(formData.otherFees),
          valid_from: formData.validFrom,
          valid_until: formData.validUntil,
        })
        .select()
        .single();

      if (error) {
        throw error.code === "23505"
          ? new Error("An OR with this number already exists.")
          : error.code === "23514"
            ? new Error("Valid until must be after valid from.")
            : error;
      }

      toast.success(`OR ${data.or_number} recorded for ${vehicle.plate}.`);
      setFormData(buildForm({ ...vehicle, registrationExpiry: data.valid_until }));
      onSaved?.(data);
    } catch (error) {
      console.error("Error saving OR:", error);
      toast.error(`Failed to save OR: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-white rounded-lg border border-slate-100 shadow-2xl">
        <div className="px-6 pt-6 pb-2 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900">Add Official Receipt</h2>
          <p className="text-sm text-slate-500 mt-1">
            Record a registration payment for {vehicle.name} ({vehicle.plate}).
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="profile-modal-scrollbar min-h-0 flex-1 overflow-y-auto px-6 pb-2">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase flex items-center">
                  <Receipt className="w-4 h-4 mr-2" /> Receipt Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="OR Number">
                    <input name="orNumber" value={formData.orNumber} onChange={handleChange} className={inputClass} required />
                  </Field>
                  <Field label="Transaction">
                    <Select
                      value={formData.transactionType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, transactionType: value }))}
                    >
                      <SelectTrigger className="enforcers-select-trigger h-[38px] w-full rounded-xl px-3.5 py-2 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="enforcers-select-options select-slide-down bg-white">
                        {["Initial Registration", "Renewal", "Transfer of Ownership", "Replacement"].map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Payment Date">
                    <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} className={inputClass} required />
                  </Field>
                  <Field label="Payor">
                    <input name="payorName" value={formData.payorName} onChange={handleChange} className={inputClass} required />
                  </Field>
                  <Field label="Valid From">
                    <input type="date" name="validFrom" value={formData.validFrom} onChange={handleChange} className={inputClass} required />
                  </Field>
                  <Field label="Valid Until">
                    <input type="date" name="validUntil" value={formData.validUntil} onChange={handleChange} className={inputClass} required />
                  </Field>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Fees (₱)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Registration Fee">
                    <input type="number" min="0" step="0.01" name="registrationFee" value={formData.registrationFee} onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Plate Fee">
                    <input type="number" min="0" step="0.01" name="plateFee" value={formData.plateFee} onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="MVUC">
                    <input type="number" min="0" step="0.01" name="mvucFee" value={formData.mvucFee} onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Penalty / Surcharge">
                    <input type="number" min="0" step="0.01" name="penaltyFee" value={formData.penaltyFee} onChange={handleChange} className={inputClass} />
                  </Field>
                  <Field label="Other Fees">
                    <input type="number" min="0" step="0.01" name="otherFees" value={formData.otherFees} onChange={handleChange} className={inputClass} />
                  </Field>
                  <div className="flex items-end justify-between rounded-xl bg-slate-100 px-3.5 py-2 text-sm">
                    <span className="text-slate-500">Total</span>
                    <span className="font-semibold text-slate-800">
                      ₱{total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-white shrink-0 flex flex-row justify-between gap-3 sm:gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="min-w-[100px]">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="min-w-[140px]">
              {saving ? "Saving..." : "Save OR"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
