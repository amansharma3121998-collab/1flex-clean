import React from 'react';

export const MoviesBoxLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} drop-shadow-[0_0_12px_rgba(229,9,20,0.6)] flex-shrink-0`}
    >
      <rect width="48" height="48" rx="12" fill="url(#box-gradient-logo)" />
      <path
        d="M14 15C14 13.8954 14.8954 13 16 13H32C33.1046 13 34 13.8954 34 15V33C34 34.1046 33.1046 35 32 35H16C14.8954 35 14 34.1046 14 33V15Z"
        fill="#141414"
        fillOpacity="0.35"
      />
      <rect x="16" y="15" width="4" height="4" rx="1" fill="white" />
      <rect x="22" y="15" width="4" height="4" rx="1" fill="white" />
      <rect x="28" y="15" width="4" height="4" rx="1" fill="white" />
      <path d="M21 22L30 27.5L21 33V22Z" fill="white" />
      <defs>
        <linearGradient id="box-gradient-logo" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E50914" />
          <stop offset="1" stopColor="#9B0008" />
        </linearGradient>
      </defs>
    </svg>
  );
};
