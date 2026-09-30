import React from "react";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder = "",
  value,
  onChange,
  error = "",
  leftIcon = null,
  helperText = "",
  required = false,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-2xl bg-white dark:bg-slate-900 border text-slate-900 dark:text-slate-100 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
            leftIcon ? "pl-11 pr-4" : "px-4"
          } py-2.5 ${
            error
              ? "border-rose-400 focus:border-rose-500 ring-rose-500/20"
              : "border-slate-200 dark:border-slate-800 focus:border-teal-600"
          }`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-[11px] font-medium text-rose-500 mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default InputField;
