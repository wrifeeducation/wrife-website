interface BookLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function BookLogo({ size = 'md', className = '' }: BookLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <svg
      viewBox="0 0 40 40"
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 8 L20 5 L32 8 L32 32 L20 35 L8 32 Z"
        fill="#FFCF4A"
        stroke="#F59E0B"
        strokeWidth="1"
      />
      <path
        d="M20 5 L20 35"
        stroke="#F59E0B"
        strokeWidth="1"
      />
      <path
        d="M11 12 L17 11"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 16 L17 15"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11 20 L17 19"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M23 11 L29 12"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M23 15 L29 16"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M23 19 L29 20"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
