import React from 'react';

/**
 * Animated Human Developer Character component.
 * States: 'idle', 'watching', 'shy', 'peeking'
 */
export default function LoginCharacter({ state }) {
  const isWatching = state === 'watching';
  const isShy = state === 'shy';
  const isPeeking = state === 'peeking';

  return (
    <div className="login-character-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width="160"
        height="180"
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <style>{`
          .char-shadow {
            transform-origin: center;
            animation: char-bounce-shadow 4s ease-in-out infinite;
          }
          .char-body-group {
            transform-origin: bottom center;
            animation: char-bounce-body 4s ease-in-out infinite;
          }
          
          .pupil {
            transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          }
          
          .left-arm {
            transform-origin: 40px 170px;
            transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .right-arm {
            transform-origin: 160px 170px;
            transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .mouth {
            transition: d 0.3s ease;
          }

          @keyframes char-bounce-body {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes char-bounce-shadow {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(0.93); opacity: 0.12; }
          }
        `}</style>

        {/* Ground Shadow */}
        <ellipse
          className="char-shadow"
          cx="100"
          cy="206"
          rx="58"
          ry="6"
          fill="#000"
          opacity="0.2"
        />

        {/* Character Main Body & Head */}
        <g className="char-body-group">
          {/* Hoodie Torso */}
          <path
            d="M 45 210 C 45 165, 70 150, 100 150 C 130 150, 155 165, 155 210 Z"
            fill="#4338ca"
            stroke="#1e1b4b"
            strokeWidth="4"
          />

          {/* Hoodie Drawstrings / Details */}
          <path d="M 90 158 L 90 178" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 110 158 L 110 178" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="90" cy="178" r="2.5" fill="#94a3b8" />
          <circle cx="110" cy="178" r="2.5" fill="#94a3b8" />

          {/* Neck */}
          <rect x="92" y="130" width="16" height="22" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="3" rx="4" />

          {/* Hoodie Hood back outline */}
          <path
            d="M 54 135 C 54 135, 52 75, 100 72 C 148 75, 146 135, 146 135 Z"
            fill="#312e81"
            stroke="#1e1b4b"
            strokeWidth="3.5"
          />

          {/* Face */}
          <circle cx="100" cy="104" r="35" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="3.5" />

          {/* Hair (Unisex messy developer hairstyle) */}
          <path
            d="M 62 100 C 60 70, 85 64, 100 68 C 115 64, 140 70, 138 100 C 144 92, 142 80, 134 76 C 122 68, 114 62, 100 65 C 86 62, 78 68, 66 76 C 58 80, 56 92, 62 100 Z"
            fill="#292524"
            stroke="#1e1b4b"
            strokeWidth="2"
          />
          <path
            d="M 80 72 Q 88 80 94 76 Q 102 82 110 76 Q 118 80 124 73"
            stroke="#292524"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Left Eyeball */}
          <circle cx="83" cy="102" r="8.5" fill="white" stroke="#1e1b4b" strokeWidth="2.5" />
          {/* Left Pupil */}
          <g
            className="pupil"
            style={{
              transform: isWatching
                ? 'translate(0px, 2.5px)'
                : isShy
                ? 'translate(0px, 0px) scale(0)'
                : isPeeking
                ? 'translate(2.5px, 0.5px)'
                : 'translate(0px, 0px)',
            }}
          >
            <circle cx="83" cy="102" r="3.5" fill="#292524" />
            <circle cx="82" cy="100" r="1.2" fill="white" />
          </g>

          {/* Right Eyeball */}
          <circle cx="117" cy="102" r="8.5" fill="white" stroke="#1e1b4b" strokeWidth="2.5" />
          {/* Right Pupil */}
          <g
            className="pupil"
            style={{
              transform: isWatching
                ? 'translate(0px, 2.5px)'
                : isShy || isPeeking
                ? 'translate(0px, 0px) scale(0)'
                : 'translate(0px, 0px)',
            }}
          >
            <circle cx="117" cy="102" r="3.5" fill="#292524" />
            <circle cx="116" cy="100" r="1.2" fill="white" />
          </g>

          {/* Glasses */}
          <circle cx="83" cy="102" r="12" stroke="#d97706" strokeWidth="2.5" fill="none" />
          <circle cx="117" cy="102" r="12" stroke="#d97706" strokeWidth="2.5" fill="none" />
          <path d="M 95 102 L 105 102" stroke="#d97706" strokeWidth="2.5" />

          {/* Eyebrows */}
          <path d="M 72 90 Q 82 86 92 90" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 108 90 Q 118 86 128 90" stroke="#292524" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Blush */}
          <circle cx="72" cy="115" r="4.5" fill="#fda4af" opacity="0.6" />
          <circle cx="128" cy="115" r="4.5" fill="#fda4af" opacity="0.6" />

          {/* Nose */}
          <path d="M 98 107 Q 100 110 102 107" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Mouth */}
          <path
            className="mouth"
            d={
              isShy
                ? 'M 95 120 L 105 120' // Straight expression
                : isPeeking
                ? 'M 94 118 Q 100 124 106 118' // Cheeky smile peeking
                : 'M 94 118 Q 100 123 106 118' // Cute smile
            }
            stroke="#1e1b4b"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

          {/* Hands with distinct finger paths overlaying face */}
          {/* Left Arm & Hand */}
          <g
            className="left-arm"
            style={{
              transform: isShy
                ? 'translate(28px, -65px) rotate(42deg)'
                : isPeeking
                ? 'translate(28px, -36px) rotate(16deg)'
                : 'translate(0px, 15px) rotate(0deg)',
            }}
          >
            {/* Hoodie sleeve */}
            <path
              d="M 32 178 Q 45 160 55 160"
              stroke="#4338ca"
              strokeWidth="15"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Hand Group (drawn so left eye is covered in shy, peeking looks between rect fingers) */}
            <g transform="translate(48, 140)">
              {/* Palm */}
              <circle cx="8" cy="12" r="8.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="2.5" />
              {/* 4 separate fingers with gaps */}
              <g transform="translate(1, 2)">
                <rect x="0" y="-12" width="3.2" height="15" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
                <rect x="4.8" y="-14" width="3.2" height="17" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
                <rect x="9.6" y="-13" width="3.2" height="16" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
                <rect x="14.4" y="-10" width="3.2" height="13" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
              </g>
            </g>
          </g>

          {/* Right Arm & Hand */}
          <g
            className="right-arm"
            style={{
              transform: isShy || isPeeking
                ? 'translate(-28px, -65px) rotate(-42deg)'
                : 'translate(0px, 15px) rotate(0deg)',
            }}
          >
            {/* Hoodie sleeve */}
            <path
              d="M 168 178 Q 155 160 145 160"
              stroke="#4338ca"
              strokeWidth="15"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Hand Group */}
            <g transform="translate(126, 140)">
              {/* Palm */}
              <circle cx="8" cy="12" r="8.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="2.5" />
              {/* 4 separate fingers with gaps */}
              <g transform="translate(1, 2)">
                <rect x="0" y="-10" width="3.2" height="13" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
                <rect x="4.8" y="-13" width="3.2" height="16" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
                <rect x="9.6" y="-14" width="3.2" height="17" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
                <rect x="14.4" y="-12" width="3.2" height="15" rx="1.5" fill="#ffedd5" stroke="#1e1b4b" strokeWidth="1.8" />
              </g>
            </g>
          </g>
      </svg>
    </div>
  );
}
