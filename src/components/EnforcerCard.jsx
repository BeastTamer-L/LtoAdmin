export default function EnforcerCard({
    name,
    location,
    battery,
    isOnline = true,
    image
}) {
    return (
        <div className="flex w-full items-center justify-between bg-[#F0F4F8] px-4 py-2.5 rounded-lg">

            
            <div className="flex items-center gap-3">
                {/* picture */}
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#102B4C] flex items-center justify-center">
                    <img
                        src={image}
                        alt={name}
                        className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                </div>

                <div>
                    <p className="text-[12px] font-medium leading-tight text-[#010101]">
                        {name}
                    </p>

                    <p className="mt-0.5 text-[11px] leading-tight text-[#8693A6]">
                        {location}
                    </p>
                </div>
            </div>

        
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[12px] text-[#171717]">
                        Battery
                    </p>

                    <p className="text-[11px] font-medium text-[#45B94A]">
                        {battery}%
                    </p>
                </div>

                
                <div
                    className={`h-2.5 w-2.5 rounded-full ${
                        isOnline
                            ? "bg-[#55C85A]"
                            : "bg-[#A0A8B2]"
                    }`}
                />
            </div>

        </div>
    );
}

