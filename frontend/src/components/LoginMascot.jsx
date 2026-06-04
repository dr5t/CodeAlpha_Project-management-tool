import React from 'react';

/**
 * Animated Login Mascot component.
 * States: 'idle', 'watching', 'shy', 'peeking'
 */
export default function LoginMascot({ state }) {
  // Determine CSS class based on state
  const isWatching = state === 'watching';
  const isShy = state === 'shy';
  const isPeeking = state === 'peeking';

  // Inline CSS variables or classes for SVG transitions
  return (
    <div className="mascot-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
      <svg
        width="150"
        height="150"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        {/* Style block for animations */}
        <style>{`
          .mascot-shadow {
            transform-origin: center;
            animation: mascot-bounce-shadow 4s ease-in-out infinite;
          }
          .mascot-body-group {
            transform-origin: bottom center;
            animation: mascot-bounce-body 4s ease-in-out infinite;
          }
          
          .pupil {
            transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          }
          
          .left-arm {
            transform-origin: 35px 150px;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .right-arm {
            transform-origin: 165px 150px;
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .mouth {
            transition: d 0.3s ease, transform 0.3s ease;
          }

          @keyframes mascot-bounce-body {
            0%, 100% { transform: translateY(0) scaleY(1); }
            50% { transform: translateY(-4px) scaleY(1.02); }
          }
          @keyframes mascot-bounce-shadow {
            0%, 100% { transform: scale(1); opacity: 0.25; }
            50% { transform: scale(0.92); opacity: 0.15; }
          }
        `}</style>

        {/* Mascot Ground Shadow */}
        <ellipse
          className="mascot-shadow"
          cx="100"
          cy="182"
          rx="64"
          ry="8"
          fill="#000"
          opacity="0.2"
        />

        {/* Mascot Body & Face Group */}
        <g className="mascot-body-group">
          {/* Outer Ears/Horns */}
          <path d="M 38 70 L 22 45 L 50 55 Z" fill="#4f46e5" stroke="#312e81" strokeWidth="4" strokeLinejoin="round" />
          <path d="M 162 70 L 178 45 L 150 55 Z" fill="#4f46e5" stroke="#312e81" strokeWidth="4" strokeLinejoin="round" />

          {/* Main Body */}
          <rect x="35" y="50" width="130" height="120" rx="45" fill="#6366f1" stroke="#312e81" strokeWidth="5" />
          
          {/* Lighter Face Screen */}
          <rect x="48" y="62" width="104" height="85" rx="30" fill="#e0e7ff" stroke="#312e81" strokeWidth="4" />

          {/* Cute Rosy Cheeks */}
          <circle cx="62" cy="122" r="7" fill="#fda4af" opacity="0.75" />
          <circle cx="138" cy="122" r="7" fill="#fda4af" opacity="0.75" />

          {/* Eyes Section */}
          <g className="eyeballs">
            {/* Left Eyeball */}
            <circle cx="72" cy="98" r="17" fill="white" stroke="#312e81" strokeWidth="3" />
            {/* Left Pupil */}
            <g
              className="pupil"
              style={{
                transform: isWatching
                  ? 'translate(0px, 4px)'
                  : isShy
                  ? 'translate(0px, 0px) scale(0)'
                  : isPeeking
                  ? 'translate(4px, 2px)'
                  : 'translate(0px, 0px)',
              }}
            >
              <circle cx="72" cy="98" r="7" fill="#1e1b4b" />
              <circle cx="70" cy="95" r="2.5" fill="white" /> {/* Reflection */}
            </g>

            {/* Right Eyeball */}
            <circle cx="128" cy="98" r="17" fill="white" stroke="#312e81" strokeWidth="3" />
            {/* Right Pupil */}
            <g
              className="pupil"
              style={{
                transform: isWatching
                  ? 'translate(0px, 4px)'
                  : isShy || isPeeking
                  ? 'translate(0px, 0px) scale(0)'
                  : 'translate(0px, 0px)',
              }}
            >
              <circle cx="128" cy="98" r="7" fill="#1e1b4b" />
              <circle cx="126" cy="95" r="2.5" fill="white" /> {/* Reflection */}
            </g>
          </g>

          {/* Mouth */}
          <path
            className="mouth"
            d={
              isShy
                ? 'M 94 125 L 106 125' // Straight neutral line when shy
                : isPeeking
                ? 'M 94 123 Q 100 128 106 123' // Cheeky smile when peeking
                : isWatching
                ? 'M 95 125 Q 100 129 105 125' // Small smile when watching
                : 'M 93 123 Q 100 128 107 123' // Normal cute smile
            }
            stroke="#1e1b4b"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Arms/Hands overlaying face */}
        {/* Left Arm & Hand */}
        <g
          className="left-arm"
          style={{
            transform: isShy
              ? 'translate(31px, -44px) rotate(42deg)'
              : isPeeking
              ? 'translate(32px, -18px) rotate(16deg)'
              : 'translate(0px, 15px) rotate(0deg)',
          }}
        >
          {/* Arm path */}
          <path
            d="M 22 152 Q 40 142 58 142"
            stroke="#4f46e5"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />
          {/* Shadow of hand */}
          <circle cx="58" cy="142" r="11" fill="#312e81" opacity="0.3" transform="translate(1px, 2px)" />
          {/* Hand circle */}
          <circle cx="58" cy="142" r="10" fill="#6366f1" stroke="#312e81" strokeWidth="3" />
          {/* Cute mechanical details on knuckles */}
          <circle cx="54" cy="139" r="1.5" fill="#c7d2fe" />
          <circle cx="58" cy="139" r="1.5" fill="#c7d2fe" />
          <circle cx="62" cy="139" r="1.5" fill="#c7d2fe" />
        </g>

        {/* Right Arm & Hand */}
        <g
          className="right-arm"
          style={{
            transform: isShy || isPeeking
              ? 'translate(-31px, -44px) rotate(-42deg)'
              : 'translate(0px, 15px) rotate(0deg)',
          }}
        >
          {/* Arm path */}
          <path
            d="M 178 152 Q 160 142 142 142"
            stroke="#4f46e5"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />
          {/* Shadow of hand */}
          <circle cx="142" cy="142" r="11" fill="#312e81" opacity="0.3" transform="translate(-1px, 2px)" />
          {/* Hand circle */}
          <circle cx="142" cy="142" r="10" fill="#6366f1" stroke="#312e81" strokeWidth="3" />
          {/* Cute mechanical details on knuckles */}
          <circle cx="138" cy="139" r="1.5" fill="#c7d2fe" />
          <circle cx="142" cy="139" r="1.5" fill="#c7d2fe" />
          <circle cx="146" cy="139" r="1.5" fill="#c7d2fe" />
        </g>
      </svg>
    </div>
  );
}
