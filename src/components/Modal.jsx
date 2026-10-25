import { Button } from "./ui/button";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  color = "#CC2B2B",
  loading = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="flex flex-col gap-4 py-7 px-7 w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#1E3A8A]">
              {title}
            </h2>

            {description && (
              <p className="mt-3 text-[14px] text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

      

        {/* Footer: same Cancel / confirm buttons as the other modals */}
        <div className="flex flex-row justify-between gap-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="min-w-[100px] text-slate-700">
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            loading={loading}
            className="min-w-[140px] text-white hover:brightness-110"
            style={{ backgroundColor: color }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}