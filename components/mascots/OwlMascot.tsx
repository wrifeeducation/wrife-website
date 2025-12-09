interface OwlMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function OwlMascot({ size = 'md', className = '' }: OwlMascotProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <svg
      viewBox="0 0 120 120"
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="60" cy="70" rx="45" ry="40" fill="#4F46E5" />
      <ellipse cx="60" cy="68" rx="42" ry="37" fill="#6366F1" />
      <circle cx="42" cy="55" r="18" fill="white" />
      <circle cx="78" cy="55" r="18" fill="white" />
      <circle cx="42" cy="55" r="10" fill="#1E1B4B" />
      <circle cx="78" cy="55" r="10" fill="#1E1B4B" />
      <circle cx="45" cy="52" r="4" fill="white" />
      <circle cx="81" cy="52" r="4" fill="white" />
      <path
        d="M55 72 L60 80 L65 72"
        fill="#F97316"
        stroke="#EA580C"
        strokeWidth="1"
      />
      <path
        d="M15 45 Q20 20 40 35"
        fill="#4F46E5"
        stroke="none"
      />
      <path
        d="M105 45 Q100 20 80 35"
        fill="#4F46E5"
        stroke="none"
      />
      <ellipse cx="35" cy="85" rx="8" ry="4" fill="#F97316" />
      <ellipse cx="85" cy="85" rx="8" ry="4" fill="#F97316" />
      <ellipse cx="30" cy="60" rx="8" ry="12" fill="#818CF8" opacity="0.5" />
      <ellipse cx="90" cy="60" rx="8" ry="12" fill="#818CF8" opacity="0.5" />
    </svg>
  );
}
