interface PencilMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function PencilMascot({ size = 'md', className = '' }: PencilMascotProps) {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 180,
    xl: 280,
  };
  
  const dimensions = sizeMap[size];

  return (
    <svg
      width={dimensions}
      height={dimensions}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Friendly pencil mascot"
    >
      <g transform="translate(40, 10)">
        <path
          d="M60 180 L60 50 Q60 30 75 20 L80 15 Q85 10 90 15 L95 20 Q110 30 110 50 L110 180 Q110 190 85 190 Q60 190 60 180 Z"
          fill="#FFD93D"
          stroke="#E8B830"
          strokeWidth="2"
        />
        
        <path
          d="M60 50 L60 70 Q85 75 110 70 L110 50 Q85 55 60 50 Z"
          fill="#F4C430"
          opacity="0.5"
        />
        
        <rect x="60" y="140" width="50" height="35" fill="#5B8DEE" stroke="#4A7CD9" strokeWidth="1.5" rx="2" />
        <rect x="65" y="145" width="40" height="4" fill="#4A7CD9" opacity="0.5" />
        
        <path
          d="M60 175 L85 200 L110 175 Z"
          fill="#FFECD2"
          stroke="#E8D4B8"
          strokeWidth="1.5"
        />
        <path
          d="M80 185 L85 200 L90 185 Z"
          fill="#2D2D2D"
        />
        
        <ellipse cx="73" cy="95" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
        <ellipse cx="97" cy="95" rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
        <circle cx="73" cy="97" r="5" fill="#333" />
        <circle cx="97" cy="97" r="5" fill="#333" />
        <circle cx="75" cy="95" r="2" fill="white" />
        <circle cx="99" cy="95" r="2" fill="white" />
        
        <path
          d="M63 90 L50 85"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M107 90 L120 85"
          stroke="#333"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        <path
          d="M78 118 Q85 125 92 118"
          stroke="#333"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        
        <ellipse cx="65" cy="115" rx="6" ry="4" fill="#FFAA99" opacity="0.5" />
        <ellipse cx="105" cy="115" rx="6" ry="4" fill="#FFAA99" opacity="0.5" />
      </g>
      
      <g transform="translate(120, 55) rotate(-15)">
        <path
          d="M0 20 Q-5 10 5 0 L15 -5 Q25 -10 30 0 L35 15 Q30 30 20 35 L10 35 Q0 30 0 20 Z"
          fill="#FFD93D"
          stroke="#E8B830"
          strokeWidth="1.5"
        />
        <ellipse cx="18" cy="20" rx="4" ry="5" fill="#FFD93D" />
        <path d="M12 12 Q18 8 24 12" stroke="#333" strokeWidth="1" fill="none" />
        <circle cx="15" cy="18" r="2" fill="#333" />
        <circle cx="21" cy="18" r="2" fill="#333" />
      </g>
    </svg>
  );
}
