import React, { ButtonHTMLAttributes } from "react";

interface ButtonWithSpinnerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    children: React.ReactNode;
    variant?: "green" | "blue" | "red"; // farklı renk opsiyonları
}

const variantClasses: Record<string, string> = {
    green: "bg-green-500 hover:bg-green-600 text-white",
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white",
};

export default function ButtonWithSpinner({
    loading = false,
    children,
    variant = "green",
    disabled,
    className = "",
    ...props
}: ButtonWithSpinnerProps) {
    // ✅ Debug: Log when loading prop changes
    React.useEffect(() => {
        console.log('[ButtonWithSpinner] loading prop changed to:', loading);
    }, [loading]);

    return (
        <button
            disabled={loading || disabled}
            className={`
        w-full flex justify-center items-center gap-2 font-medium py-3 rounded-lg transition transform
        ${loading || disabled ? "bg-gray-400 cursor-not-allowed" : variantClasses[variant]}
        ${!loading && !disabled ? "active:scale-95" : ""}
        ${className}
      `}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                    ></path>
                </svg>
            )}
            {children}
        </button>
    );
}
