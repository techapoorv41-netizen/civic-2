import React from "react";
import { Loader2 } from "lucide-react";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variants = {
    primary:
      "bg-govOrange hover:bg-govOrange/90 text-white font-bold shadow-md shadow-govOrange/25 focus:ring-govOrange border border-transparent",
    secondary:
      "bg-govSlate hover:bg-govNavy text-white font-semibold shadow-sm focus:ring-govSlate border border-transparent",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-md shadow-rose-600/20 focus:ring-rose-500 border border-transparent",
    outline:
      "border-2 border-govSlate text-govSlate hover:bg-govLight font-semibold focus:ring-govSlate",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
