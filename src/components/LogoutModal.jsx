

export default function LogoutModal({
    isOpen,
    onClose,
    onConfirm
}){


    if (!isOpen) return null;
    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
            <div className="w-full max-w-[350px] rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex flex-col items-center justify-between px-6 py-4">
                    <div className="w-full mb-3">
                        <h1 className="text-[#CC2B2B] font-semibold text-lg text-center mb-3">LOG OUT</h1>
                        <span className="text-center text-black block">Are you sure you want to logout?</span>
                    </div>
                    <div className="flex w-full justify-between gap-3 px-6 py-4">
                        <button onClick={onClose} className="bg-[#8693A6] text-white rounded-md py-3 text-sm font-medium transition hover:bg-[#8693A6]/90 flex-1">
                            Cancel
                        </button>

                        <button onClick={onConfirm} className="rounded-md bg-[#CC2B2B] py-3 text-sm font-medium text-white transition hover:bg-[#CC2B2B]/90 flex-1"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
      </div>
    )
}