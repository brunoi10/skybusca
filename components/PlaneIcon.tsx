
import React from 'react';

interface PlaneIconProps {
  heading: number;
  isSelected: boolean;
}

const PlaneIcon: React.FC<PlaneIconProps> = ({ heading, isSelected }) => {
  return (
    <div 
      className={`transition-all duration-500 ${isSelected ? 'animate-plane-selected z-[1000]' : ''}`}
      style={{ 
        transform: isSelected ? undefined : `rotate(${heading}deg)`,
        ['--plane-rotation' as any]: `${heading}deg`
      }}
    >
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
      >
        <path 
          d="M21 16V14.5L13 9.5V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9.5L2 14.5V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" 
          fill={isSelected ? "#38bdf8" : "#ffffff"} 
          stroke={isSelected ? "#ffffff" : "#000000"} 
          strokeWidth={isSelected ? "1.5" : "0.8"}
        />
      </svg>
    </div>
  );
};

export default PlaneIcon;
