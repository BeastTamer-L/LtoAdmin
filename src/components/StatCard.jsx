import { ShieldCheck } from "lucide-react";

function StatCard({
    title,
    value,
    subtitle,
    icon: Icon = ShieldCheck,
    color: color = "#4F6AD8"
}) {
    return (
        <div className="w-full rounded-md border border-[#E2E8F0] bg-white px-6 py-5 shadow-xs">
            
            {
                title && (
                <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#171717] font-transform: uppercase">
                        {title}
                    </span>

                    <div className={`flex h-7 w-7  items-center justify-center rounded-sm`}  style={{ backgroundColor: `${color}1A` }}> 
                        <Icon size={15} strokeWidth={2}  style={{ color: `${color}` }} />
                    </div>
                </div>    
                )
            }
            

            <p className="mt-3 text-[30px] font-semibold leading-none" style={{ color: `${color}`}}>
                {value}
            </p>

            <p className="mt-3 text-[12px] text-[#8693A6]">
                {subtitle}
            </p>
        </div>
    );
}

export default StatCard;