"use client";

import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export default function Input({ 
  label, 
  containerClassName = '', 
  className = '', 
  ...props 
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-2 mb-6 ${containerClassName}`}>
      {label && (
        <label className="text-[12px] font-semibold tracking-widest text-on-surface-variant uppercase ml-1">
          {label}
        </label>
      )}
      <div className={`
        h-[52px] rounded-md px-4 flex items-center transition-all duration-200
        ${isFocused ? "bg-white shadow-level1" : "bg-[#F2F2F1]"}
      `}>
        <input
          className={`
            w-full h-full bg-transparent outline-none text-on-surface font-geist text-base placeholder:text-on-surface-variant
            ${className}
          `}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </div>
    </div>
  );
}
