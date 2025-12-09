interface BearMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function BearMascot({ size = 'md', className = '' }: BearMascotProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <svg
      viewBox="0 0 120 140"
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="30" cy="25" r="18" fill="#92400E" />
      <circle cx="30" cy="25" r="10" fill="#FCD34D" />
      <circle cx="90" cy="25" r="18" fill="#92400E" />
      <circle cx="90" cy="25" r="10" fill="#FCD34D" />
      <ellipse cx="60" cy="60" rx="45" ry="42" fill="#B45309" />
      <ellipse cx="60" cy="60" rx="42" ry="38" fill="#D97706" />
      <ellipse cx="60" cy="75" rx="25" ry="18" fill="#FCD34D" />
      <circle cx="42" cy="50" r="6" fill="#1C1917" />
      <circle cx="78" cy="50" r="6" fill="#1C1917" />
      <circle cx="44" cy="48" r="2" fill="white" />
      <circle cx="80" cy="48" r="2" fill="white" />
      <ellipse cx="60" cy="68" rx="8" ry="6" fill="#78350F" />
      <path
        d="M52 80 Q60 88 68 80"
        stroke="#78350F"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="35" cy="60" r="8" fill="#FBBF24" opacity="0.6" />
      <circle cx="85" cy="60" r="8" fill="#FBBF24" opacity="0.6" />
      <rect x="35" y="100" width="50" height="35" rx="8" fill="#F97316" />
      <rect x="40" y="105" width="40" height="25" rx="5" fill="#FDBA74" />
    </svg>
  );
}
