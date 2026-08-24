export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-[#0F2744]">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600" aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {cancelText}
          </button>

          <button onClick={onConfirm} className="rounded-md bg-[#0F2744] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#16385F]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}