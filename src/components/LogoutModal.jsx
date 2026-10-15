export default function LogoutModal({
    isOpen,
    onClose,
    onConfirm
}) {

    if (!isOpen) return null;
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4" onClick={onClose}>
            <div className="w-full max-w-[350px] rounded-lg shadow-2xl p-6 bg-white border-lg" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center justify-between text-center">
                    {/* Simplified Title */}
                    <h2 className="text-slate-900 font-bold text-xl mb-2">
                        Sign Out
                    </h2>

                    {/* Simplified Body Copy */}
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Are you sure you want to log out of your session?
                    </p>

                    {/* Modern Action Buttons */}
                    <div className="flex w-full justify-between gap-3">
                        {/* Cancel Button */}
                        <button
                            onClick={onClose}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>

                        {/* Confirm Button - Red */}
                        <button
                            onClick={onConfirm}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-xl transition-colors shadow-md"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}