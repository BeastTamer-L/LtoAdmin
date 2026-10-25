import * as React from "react"
import Spinner from "./spinner"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
  loading?: boolean // shows a spinner before the label and blocks clicks while a process runs
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"

    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"

    const variants: Record<string, string> = {
      default: "bg-[#1E3A8A] text-white shadow hover:bg-[#2A4A9E]",
      destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
      outline: "border border-slate-300 bg-white shadow-sm hover:bg-slate-50",
      secondary: "bg-slate-200 text-slate-900 shadow-sm hover:bg-slate-300",
      ghost: "hover:bg-slate-100 hover:text-slate-900",
      link: "text-orange-500 underline-offset-4 hover:underline",
    }

    const sizes: Record<string, string> = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    }

    return (
      <Comp
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className ?? ""}`}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button }