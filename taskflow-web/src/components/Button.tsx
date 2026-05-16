import React from 'react';

interface ButtonProps {
  title: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  title,
  onClick,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const baseStyles = "h-[52px] rounded-lg px-6 flex items-center justify-center transition-all active:scale-95 font-geist font-semibold text-base";
  
  const variants = {
    primary: "bg-primary text-white",
    secondary: "bg-transparent text-primary",
    outline: "bg-transparent border border-outline text-on-surface",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        title
      )}
    </button>
  );
}
