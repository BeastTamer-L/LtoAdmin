import { ChevronDown, FileDown, Printer } from "lucide-react";
import Logo from "../assets/logo.png";
import { formatClock } from "../lib/violationRecords";

const getDetailFields = (record) => [
  ["Enforcer", record.enforcerName],
  ["License Number", record.licenseNumber],
  ["Plate Number", record.plate],
  ["Driver / Offender", record.driver],
  ["Date & Time", `${record.date} · ${record.time}`],
  ["Violation Location", record.location],
  ["Date of Birth", record.dateOfBirth],
  ["Vehicle Type", record.vehicleType],
  ["Vehicle Status", record.vehicleStatus],
  ["Violations", record.violations.join(", ")],
  ["LTO Code", record.ltoCodes.join(", ")],
  ["Actions Taken", record.actions.length > 0 ? record.actions.join(", ") : "None"],
];

const isSignatureImage = (value) => /^(data:image\/|https?:\/\/)/.test(value || "");

const getSignatures = (record) => [
  ["Officer Signature", record.officerSignature],
  ["Driver Signature", record.driverSignature],
];

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

// Print (or save as PDF) just the ticket, from a hidden frame so the page's own layout cannot interfere
const printTicket = (record) => {
  const logoUrl = new URL(Logo, window.location.href).href;
  const fields = getDetailFields(record)
    .map(([label, value]) => `<div class="field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || "—")}</dd></div>`)
    .join("");
  const signatures = getSignatures(record)
    .map(
      ([label, value]) =>
        `<div class="sig"><div class="sig-box">${
          isSignatureImage(value) ? `<img src="${escapeHtml(value)}" alt="${escapeHtml(label)}" />` : `<span class="muted">Not available</span>`
        }</div><div class="sig-label">${escapeHtml(label)}</div></div>`
    )
    .join("");
  const transcript =
    record.transcriptLines.length > 0
      ? `<ul>${record.transcriptLines
          .map((line) => `<li><span class="time">${formatClock(line.t0)}</span>${escapeHtml(line.text)}</li>`)
          .join("")}</ul>`
      : `<p class="muted">No transcript is available for this violation.</p>`;
  const image = /^https?:\/\//.test(record.imageUri || "")
    ? `<img class="photo" src="${escapeHtml(record.imageUri)}" alt="Captured vehicle" />`
    : `<p class="muted">No captured images are attached to this violation.</p>`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>UOVR ${escapeHtml(record.uovrNo)}</title>
<style>
  @page { margin: 14mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, Arial, sans-serif; color: #0f172a; font-size: 13px; }
  header { display: flex; align-items: center; justify-content: space-between; background: #1E3A8A; color: #fff; padding: 12px 16px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  header .brand { display: flex; align-items: center; gap: 10px; }
  header img { height: 32px; width: 32px; object-fit: contain; }
  header .name { font-size: 16px; font-weight: 900; letter-spacing: -0.02em; }
  header .name i { color: #f97316; }
  header .sub { font-size: 11px; color: #e2e8f0; }
  header .no { font-size: 14px; font-weight: 600; }
  dl { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px 24px; margin: 24px 0; }
  dt { font-size: 11px; color: #64748b; font-weight: 600; }
  dd { margin: 4px 0 0; font-size: 14px; font-weight: 600; }
  h2 { font-size: 13px; margin: 20px 0 6px; padding-bottom: 6px; border-bottom: 2px solid #cbd5e1; }
  ul { list-style: none; padding: 0; margin: 8px 0; }
  li { margin: 4px 0; color: #475569; }
  .time { font-family: monospace; font-size: 11px; color: #94a3b8; margin-right: 10px; }
  .muted { color: #64748b; }
  .photo { max-width: 100%; max-height: 320px; object-fit: contain; }
  .sigs { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
  .sig-box { height: 90px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #94a3b8; }
  .sig-box img { max-height: 84px; max-width: 100%; object-fit: contain; }
  .sig-label { margin-top: 6px; font-size: 11px; font-weight: 600; color: #64748b; text-align: center; }
</style></head><body>
<header>
  <div class="brand"><img src="${logoUrl}" alt="CAMOTE" /><div><div class="name"><i>CAM</i>OTE</div><div class="sub">North Caloocan City Traffic Office - Complete Violation Case</div></div></div>
  <div class="no">UOVR No. ${escapeHtml(record.uovrNo)}</div>
</header>
<dl>${fields}</dl>
<div class="sigs">${signatures}</div>
<h2>Violation Transcript</h2>${transcript}
<h2>Captured Images</h2>${image}
<h2>Video Recording</h2><p class="muted">${record.videoOnDevice ? "The video for this violation is stored on the enforcer's device." : "No video recording is attached to this violation."}</p>
</body></html>`;

  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  frame.onload = () => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1000);
  };
  frame.srcdoc = html;
  document.body.appendChild(frame);
};

export default function ViolationFullDetailsModal({ record, onClose }) {
    const detailFields = getDetailFields(record);
    const hasImage = /^https?:\/\//.test(record.imageUri || "");

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
        <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg border border-slate-100 bg-white shadow-2xl sm:max-w-4xl">
          <header className="flex shrink-0 items-center justify-between gap-4 bg-[#1E3A8A] px-4 py-3 text-white md:px-5">
            <div className="flex items-center gap-2">
              <img src={Logo} alt="CAMOTE" className="h-8 w-8 object-contain" />
              <div>
                <p className="text-base font-black leading-tight tracking-tight" style={{ fontFamily: '"TT Hoves", sans-serif' }}>
                  <span className="italic text-orange-500">CAM</span>
                  <span className="ml-[1px]">OTE</span>
                </p>
                <p className="text-xs font-medium text-slate-200">
                  North Caloocan City Traffic Office - Complete Violation Case
                </p>
              </div>
            </div>
            <p className="shrink-0 text-sm font-medium md:text-base">
              UOVR No. {record.uovrNo}
            </p>
          </header>

          <div className="profile-modal-scrollbar min-h-0 flex-1 overflow-y-auto p-5 md:p-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {detailFields.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-medium text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>

            <div className="grid grid-cols-1 gap-6 pt-8 sm:grid-cols-2">
              {getSignatures(record).map(([label, value]) => (
                <div key={label}>
                  <div className="flex h-24 items-center justify-center border-b border-slate-400">
                    {isSignatureImage(value) ? (
                      <img src={value} alt={label} className="max-h-20 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400">Not available</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-center text-xs font-medium text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-8">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between border-b-2 border-slate-300 py-3 text-sm font-medium text-slate-900">
                  Violation Transcript
                  <ChevronDown size={18} className="transition group-open:rotate-180" />
                </summary>
                {record.transcriptLines.length > 0 ? (
                  <ul className="space-y-1.5 py-3 text-sm text-slate-600">
                    {record.transcriptLines.map((line, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="shrink-0 font-mono text-xs text-slate-400">{formatClock(line.t0)}</span>
                        <span>{line.text}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-sm text-slate-500">
                    {record.transcriptStatus === "pending"
                      ? "The transcript is still being processed."
                      : "No transcript is available for this violation."}
                  </p>
                )}
              </details>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between border-b-2 border-slate-300 py-3 text-sm font-medium text-slate-900">
                  Captured Images
                  <ChevronDown size={18} className="transition group-open:rotate-180" />
                </summary>
                {hasImage ? (
                  <img src={record.imageUri} alt="Captured vehicle" className="my-3 max-h-80 rounded-md border border-slate-200 object-contain" />
                ) : (
                  <p className="py-3 text-sm text-slate-500">
                    No captured images are attached to this violation.
                  </p>
                )}
              </details>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between border-b-2 border-slate-300 py-3 text-sm font-medium text-slate-900">
                  Video Recording
                  <ChevronDown size={18} className="transition group-open:rotate-180" />
                </summary>
                <p className="py-3 text-sm text-slate-500">
                  {record.videoOnDevice
                    ? "The video for this violation is stored on the enforcer's device."
                    : "No video recording is attached to this violation."}
                </p>
              </details>
            </div>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-white p-4 md:px-6">
            <button
              type="button"
              onClick={() => onClose()}
              className="inline-flex min-w-[100px] cursor-pointer items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              Close
            </button>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => printTicket(record)}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-[#1E3A8A] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2A4A9E]"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                type="button"
                onClick={() => printTicket(record)}
                title="Choose Save as PDF in the print dialog"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-green-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                <FileDown size={16} />
                Export PDF
              </button>
            </div>
          </footer>
        </div>
      </div>
    );
}
