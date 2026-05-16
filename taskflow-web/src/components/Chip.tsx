import React from 'react';

interface ChipProps {
  label: string;
  color?: string;
  className?: string;
}

export default function Chip({ 
  label, 
  color = '#4a654e', 
  className = '' 
}: ChipProps) {
  // Convert hex to rgba for 10% opacity if it's a hex
  const bgColor = color.startsWith('#') ? `${color}1A` : color;

  return (
    <div 
      className={`px-3 py-1.5 rounded-full inline-flex items-center justify-center ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <span 
        className="text-xs font-medium font-geist"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
