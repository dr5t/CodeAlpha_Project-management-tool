import React from 'react';

/**
 * Animated Anime-Style Developer Character.
 * States: 'idle', 'watching', 'shy', 'peeking'
 */
export default function LoginCharacter({ state }) {
  const isWatching = state === 'watching';
  const isShy = state === 'shy';
  const isPeeking = state === 'peeking';

  return (
    <div className="login-character-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg
        width="180"
        height="200"
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <style>{`
          .anime-shadow {
            transform-origin: center;
            animation: anime-bounce-shadow 4s ease-in-out infinite;
          }
          .anime-body-group {
            transform-origin: bottom center;
            animation: anime-bounce-body 4s ease-in-out infinite;
          }
          
          .pupil {
            transition: transform 0.28s cubic-bezier(0.25, 1, 0.5, 1);
          }
          
          .left-arm {
            transform-origin: 38px 175px;
            transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .right-arm {
            transform-origin: 162px 175px;
            transition: transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .mouth {
            transition: d 0.3s ease, transform 0.3s ease;
          }
          
          .eyebrow {
            transition: transform 0.3s ease;
          }

          @keyframes anime-bounce-body {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes anime-bounce-shadow {
            0%, 100% { transform: scale(1); opacity: 0.18; }
            50% { transform: scale(0.92); opacity: 0.11; }
          }
        `}</style>

        {/* Shadow */}
        <ellipse
          className="anime-shadow"
          cx="100"
          cy="208"
          rx="52"
          ry="6"
          fill="#000"
          opacity="0.18"
        />

        {/* Anime Character Group */}
        <g className="anime-body-group">
          {/* Back Hair (under shoulders) */}
          <path
            d="M 55 110 C 50 140, 60 170, 70 175 C 75 160, 68 120, 68 110 Z"
            fill="#1c1917"
          />
          <path
            d="M 145 110 C 150 140, 140 170, 130 175 C 125 160, 132 120, 132 110 Z"
            fill="#1c1917"
          />

          {/* Shoulders & Hoodie (Unisex street-style hoodie) */}
          <path
            d="M 40 215 C 40 175, 66 154, 100 154 C 134 154, 160 175, 160 215 Z"
            fill="#1e1b4b"
            stroke="#090514"
            strokeWidth="3.5"
          />
          {/* Collar/Hood details */}
          <path
            d="M 68 154 C 80 172, 120 172, 132 154"
            stroke="#090514"
            strokeWidth="3.5"
            fill="#312e81"
          />
          <path d="M 92 165 L 92 188" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
          <path d="M 108 165 L 108 188" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="92" cy="188" r="2" fill="#a5b4fc" />
          <circle cx="108" cy="188" r="2" fill="#a5b4fc" />

          {/* Neck */}
          <path
            d="M 88 128 L 88 150 Q 100 158 112 150 L 112 128 Z"
            fill="#fee2e2"
            stroke="#090514"
            strokeWidth="3"
          />

          {/* Face (Anime pointed chin) */}
          <path
            d="M 66 94 C 66 122, 82 136, 100 136 C 118 136, 134 122, 134 94 C 134 70, 66 70, 66 94 Z"
            fill="#ffe4e6"
            stroke="#090514"
            strokeWidth="3.5"
          />

          {/* Rosy blush */}
          <ellipse cx="73" cy="116" rx="5" ry="3" fill="#fda4af" opacity="0.6" />
          <ellipse cx="127" cy="116" rx="5" ry="3" fill="#fda4af" opacity="0.6" />

          {/* Left Eyeball */}
          <circle cx="82" cy="100" r="11" fill="white" stroke="#090514" strokeWidth="2.5" />
          {/* Left Iris / Anime Glow */}
          <g
            className="pupil"
            style={{
              transform: isWatching
                ? 'translate(0px, 3px)'
                : isShy
                ? 'translate(0px, 0px) scale(0)'
                : isPeeking
                ? 'translate(3px, 1px)'
                : 'translate(0px, 0px)',
            }}
          >
            {/* Colorful gradient-like iris */}
            <circle cx="82" cy="100" r="8" fill="#818cf8" />
            <circle cx="82" cy="100" r="4.5" fill="#312e81" />
            <circle cx="79.5" cy="97" r="2.5" fill="white" /> {/* Core highlight */}
            <circle cx="84.5" cy="102" r="1.2" fill="white" /> {/* Accent highlight */}
          </g>
          {/* Thick Anime Eyelash / Liner */}
          <path d="M 70 96 C 75 91, 89 91, 94 96" stroke="#090514" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 92 94 L 95 91" stroke="#090514" strokeWidth="2" strokeLinecap="round" />

          {/* Right Eyeball */}
          <circle cx="118" cy="100" r="11" fill="white" stroke="#090514" strokeWidth="2.5" />
          {/* Right Iris / Anime Glow */}
          <g
            className="pupil"
            style={{
              transform: isWatching
                ? 'translate(0px, 3px)'
                : isShy || isPeeking
                ? 'translate(0px, 0px) scale(0)'
                : 'translate(0px, 0px)',
            }}
          >
            <circle cx="118" cy="100" r="8" fill="#818cf8" />
            <circle cx="118" cy="100" r="4.5" fill="#312e81" />
            <circle cx="115.5" cy="97" r="2.5" fill="white" />
            <circle cx="120.5" cy="102" r="1.2" fill="white" />
          </g>
          {/* Thick Anime Eyelash / Liner */}
          <path d="M 106 96 C 111 91, 125 91, 130 96" stroke="#090514" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 108 94 L 105 91" stroke="#090514" strokeWidth="2" strokeLinecap="round" />

          {/* Eyebrows */}
          <path
            className="eyebrow"
            style={{ transform: isShy || isPeeking ? 'translateY(1.5px)' : 'none' }}
            d="M 70 87 Q 82 82 91 86"
            stroke="#090514"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="eyebrow"
            style={{ transform: isShy || isPeeking ? 'translateY(1.5px)' : 'none' }}
            d="M 109 86 Q 118 82 130 87"
            stroke="#090514"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Nose (cute anime dot) */}
          <circle cx="100" cy="109" r="1.5" fill="#4c0519" />

          {/* Mouth */}
          <path
            className="mouth"
            d={
              isShy
                ? 'M 96 119 L 104 119' // Small neutral mouth
                : isPeeking
                ? 'M 95 117 Q 100 123 105 117' // Happy peeking grin
                : 'M 96 117 Q 100 121 104 117' // Cute soft smile
            }
            stroke="#090514"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Front Hair (Layered anime bangs framing face) */}
          {/* Left strand */}
          <path
            d="M 64 80 Q 75 106 79 108 C 73 90, 68 82, 64 80 Z"
            fill="#292524"
          />
          {/* Middle fringe */}
          <path
            d="M 78 72 Q 92 108 95 108 C 91 85, 84 76, 78 72 Z"
            fill="#292524"
          />
          {/* Right strand */}
          <path
            d="M 122 72 Q 108 108 105 108 C 109 85, 116 76, 122 72 Z"
            fill="#292524"
          />
          <path
            d="M 136 80 Q 125 106 121 108 C 127 90, 132 82, 136 80 Z"
            fill="#292524"
          />
          
          {/* Top hair spikes */}
          <path
            d="M 65 76 C 75 60, 100 55, 125 60 C 135 70, 140 85, 138 96 C 145 78, 130 63, 100 60 C 70 63, 58 78, 65 76 Z"
            fill="#292524"
          />
          <path
            d="M 95 56 Q 104 46 102 58"
            stroke="#292524"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          /> {/* Ahoge (cute hair strand on top) */}
        </g>

        {/* Elegant Hands overlaying face */}
        {/* Left Arm & Hand */}
        <g
          className="left-arm"
          style={{
            transform: isShy
              ? 'translate(28px, -62px) rotate(42deg)'
              : isPeeking
              ? 'translate(28px, -33px) rotate(16deg)'
              : 'translate(0px, 15px) rotate(0deg)',
          }}
        >
          {/* Sleeve */}
          <path
            d="M 22 178 Q 38 160 52 160"
            stroke="#1e1b4b"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 22 178 Q 38 160 52 160"
            stroke="#312e81"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Hand Group (drawn so left eye is covered in shy, peeking looks between rect fingers) */}
          <g transform="translate(45, 140)">
            {/* Elegant Anime Palm */}
            <path
              d="M 2 15 C 2 7, 14 7, 14 15 Z"
              fill="#ffe4e6"
              stroke="#090514"
              strokeWidth="2.5"
            />
            {/* 4 separate long anime fingers with gaps */}
            <g transform="translate(1, 1)">
              <rect x="0" y="-14" width="2.8" height="17" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
              <rect x="4.4" y="-17" width="2.8" height="20" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
              <rect x="8.8" y="-16" width="2.8" height="19" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
              <rect x="13.2" y="-12" width="2.8" height="15" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
            </g>
          </g>
        </g>

        {/* Right Arm & Hand */}
        <g
          className="right-arm"
          style={{
            transform: isShy || isPeeking
              ? 'translate(-28px, -62px) rotate(-42deg)'
              : 'translate(0px, 15px) rotate(0deg)',
          }}
        >
          {/* Sleeve */}
          <path
            d="M 178 178 Q 162 160 148 160"
            stroke="#1e1b4b"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 178 178 Q 162 160 148 160"
            stroke="#312e81"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Hand Group */}
          <g transform="translate(126, 140)">
            {/* Elegant Anime Palm */}
            <path
              d="M 2 15 C 2 7, 14 7, 14 15 Z"
              fill="#ffe4e6"
              stroke="#090514"
              strokeWidth="2.5"
            />
            {/* 4 separate long anime fingers with gaps */}
            <g transform="translate(1, 1)">
              <rect x="0" y="-12" width="2.8" height="15" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
              <rect x="4.4" y="-16" width="2.8" height="19" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
              <rect x="8.8" y="-17" width="2.8" height="20" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
              <rect x="13.2" y="-14" width="2.8" height="17" rx="1.4" fill="#ffe4e6" stroke="#090514" strokeWidth="1.8" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
