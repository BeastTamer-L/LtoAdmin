export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  color = "#CC2B2B"
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="flex flex-col gap-4 py-7 px-7 w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F2744]">
              {title}
            </h2>

            {description && (
              <p className="mt-3 text-[14px] text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

      

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-[#8693A6] bg-[#F0F4F8] px-5 py-2 text-[14px] font-medium text-slate-600 transition hover:cursor-pointer"
          >
            {cancelText}
          </button>

          <button onClick={onConfirm} className="rounded-lg px-5 py-2 text-[14px] font-medium text-white transition hover:cursor-pointer" style={{backgroundColor: `${color}`}} 
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}