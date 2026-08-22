

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "#4F6AD8"
}) {
    return (
        <div className="w-full rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium uppercase text-[#171717] ">
                        {title}
                    </span>
                    {
                        Icon && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-sm" style={{ backgroundColor: `${color}1A` }}>
                                <Icon
                                    size={15}
                                    strokeWidth={2}
                                    style={{ color }}
                                />
                            </div>    
                        )
                    }
                </div>
            <p className="mt-3 text-[30px] font-semibold leading-none" style={{ color }}>
                {value}
            </p>

            {subtitle && (
                <p
                    className="mt-3 text-[15px] text-[#8693A6]"
                >
                    {subtitle}
                </p>
            )}
        </div>
    );
}

