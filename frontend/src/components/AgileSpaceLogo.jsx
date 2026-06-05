
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
      
      {/* 1. Circle loop (Blue) */}
      <path 
        d="M 22 140 L 85 140 C 60 115 50 75 75 50 C 100 25 140 30 160 60 C 170 75 172 90 168 105 C 160 128 135 142 110 140" 
        stroke="#3b82f6" 
        strokeWidth="16" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* 2. White Right Leg of A (drawn behind blue arrow) */}
      <path 
        d="M 105 62 L 126 118" 
        stroke="#ffffff" 
        strokeWidth="15" 
        strokeLinecap="round" 
      />
      
      {/* 3. Blue Diagonal Arrow Line */}
      <path 
        d="M 72 120 L 148 54" 
        stroke="#3b82f6" 
        strokeWidth="16" 
        strokeLinecap="round" 
      />
      
      {/* Blue Diagonal Arrow Head (sharp polygon) */}
      <polygon 
        points="170,35 125,41 161,77" 
        fill="#3b82f6" 
      />
      
      {/* 4. White Left Leg of A & Crossbar stub (drawn on top of blue arrow) */}
      <path 
        d="M 84 118 L 105 62" 
        stroke="#ffffff" 
        strokeWidth="15" 
        strokeLinecap="round" 
      />
      <path 
        d="M 94 92 L 103 92" 
        stroke="#ffffff" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      
      {/* 5. White bottom-right arrow */}
      <path 
        d="M 124 144 L 152 144" 
        stroke="#ffffff" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      <polygon 
        points="170,144 148,131 148,157" 
        fill="#ffffff" 
      />
    </svg>
  );
}
