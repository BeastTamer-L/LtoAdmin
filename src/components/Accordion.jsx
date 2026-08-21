import { useState } from "react";
import { ChevronDown } from "lucide-react";

function Accordion({ title, children }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-[#8693A6]">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-5 text-left"
            >
                <span className="text-[16px] font-semibold text-[#010101]">
                    {title}
                </span>

                <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ease-in-out ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </button>

            {/* Content */}
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}>
                <div className="overflow-hidden">
                    <div className="pb-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Accordion;