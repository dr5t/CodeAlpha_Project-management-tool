
export default function AgileSpaceLogo({ size = 32, showBg = false, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {showBg && <rect width="200" height="200" rx="44" fill="#081c3c" />}
      
      {/* Circle loop (Blue) */}
      <path 
        d="M 35 140 C 35 140 70 140 85 140 C 60 115 50 75 75 50 C 100 25 140 30 160 60 C 170 75 172 90 168 105 C 160 128 135 142 110 140" 
        stroke="#3b82f6" 
        strokeWidth="16" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Diagonal right leg of A (Blue) */}
      <path 
        d="M 72 120 L 165 40" 
        stroke="#3b82f6" 
        strokeWidth="16" 
        strokeLinecap="round" 
      />
      
      {/* Diagonal arrow head (Blue) */}
      <path 
        d="M 130 38 L 168 37 L 167 75" 
        stroke="#3b82f6" 
        strokeWidth="16" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* White crossbar of 'A' */}
      <path 
        d="M 92 78 L 118 78" 
        stroke="#ffffff" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      
      {/* White diagonal leg of 'A' (lower right) */}
      <path 
        d="M 125 102 L 138 114" 
        stroke="#ffffff" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      
      {/* White horizontal arrow at bottom right (line) */}
      <path 
        d="M 128 146 L 168 146" 
        stroke="#ffffff" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      
      {/* White horizontal arrow head */}
      <path 
        d="M 154 136 L 168 146 L 154 156" 
        stroke="#ffffff" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
