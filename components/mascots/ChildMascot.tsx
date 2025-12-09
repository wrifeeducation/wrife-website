interface ChildMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  waving?: boolean;
}

export default function ChildMascot({ size = 'md', className = '', waving = true }: ChildMascotProps) {
  const sizeClasses = {
    sm: 'w-16 h-20',
    md: 'w-24 h-32',
    lg: 'w-36 h-48',
    xl: 'w-48 h-64',
  };

  return (
    <svg
      viewBox="0 0 100 130"
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="35" r="28" fill="#8B5A2B" />
      <circle cx="50" cy="30" r="22" fill="#A0522D" />
      <ellipse cx="50" cy="42" rx="20" ry="18" fill="#D2691E" />
      <circle cx="42" cy="40" r="3" fill="#1C1917" />
      <circle cx="58" cy="40" r="3" fill="#1C1917" />
      <circle cx="43" cy="39" r="1" fill="white" />
      <circle cx="59" cy="39" r="1" fill="white" />
      <path
        d="M45 50 Q50 55 55 50"
        stroke="#1C1917"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="30" y="65" width="40" height="45" rx="8" fill="#3B82F6" />
      <rect x="35" y="70" width="30" height="35" rx="5" fill="#60A5FA" />
      <rect x="25" y="110" width="15" height="18" rx="4" fill="#1E40AF" />
      <rect x="60" y="110" width="15" height="18" rx="4" fill="#1E40AF" />
      {waving ? (
        <>
          <rect x="68" y="68" width="8" height="25" rx="4" fill="#D2691E" transform="rotate(-30 72 80)" />
          <circle cx="82" cy="58" r="6" fill="#D2691E" />
        </>
      ) : (
        <rect x="68" y="70" width="8" height="22" rx="4" fill="#D2691E" />
      )}
      <rect x="24" y="70" width="8" height="22" rx="4" fill="#D2691E" />
      <rect x="30" y="100" width="40" height="10" rx="3" fill="#F97316" />
      <rect x="38" y="102" width="24" height="6" rx="2" fill="#FDBA74" />
    </svg>
  );
}
