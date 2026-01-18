import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonWithSpinnerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
    variant?: "primary" | "success" | "danger" | "secondary" | "green" | "blue" | "red";
}

const variantClasses: Record<string, string> = {
    // New semantic names
    primary: "bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 hover:shadow-red-600/40",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white shadow-lg shadow-gray-600/25 hover:shadow-gray-600/40",
    // Legacy names (backward compatibility)
    green: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40",
    blue: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40",
    red: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/25 hover:shadow-red-600/40",
};

export default function ButtonWithSpinner({
    loading = false,
    children,
    variant = "primary",
    disabled,
    className = "",
    ...props
}: ButtonWithSpinnerProps) {
    const isDisabled = loading || disabled;

    return (
        <button
            disabled={isDisabled}
            className={`
                w-full flex justify-center items-center gap-2
                font-semibold py-3 px-6 rounded-xl
                transition-all duration-200 ease-out
                ${isDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                    : variantClasses[variant]
                }
                ${!isDisabled ? "active:scale-[0.98] hover:-translate-y-0.5" : ""}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <Loader2 className="w-5 h-5 animate-spin" />
            )}
            <span className={loading ? "opacity-80" : ""}>
                {children}
            </span>
        </button>
    );
}
