import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  className?: string;
}

export default function ProgressBar({ 
  progress, 
  color = '#000000', 
  className = '' 
}: ProgressBarProps) {
  return (
    <div className={`h-1 bg-[#F2F2F1] rounded-full overflow-hidden w-full ${className}`}>
      <div 
        className="h-full transition-all duration-300 ease-out"
        style={{ 
          width: `${Math.min(1, Math.max(0, progress)) * 100}%`,
          backgroundColor: color 
        }}
      />
    </div>
  );
}
