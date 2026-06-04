
/**
 * Animated Anime-Style Developer Character.
 * Redesigned to match the pink-haired anime girl with wrapped bandage top.
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
        <defs>
          <linearGradient id="hair-grad" x1="100" y1="40" x2="100" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbcfe8" /> {/* soft light pink highlight */}
            <stop offset="50%" stopColor="#f472b6" /> {/* pink */}
            <stop offset="100%" stopColor="#db2777" /> {/* shadow deep pink */}
          </linearGradient>
          
          <linearGradient id="eye-grad" x1="82" y1="90" x2="82" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" /> {/* cyan */}
            <stop offset="60%" stopColor="#0891b2" /> {/* dark cyan */}
            <stop offset="100%" stopColor="#0f172a" /> {/* dark iris base */}
          </linearGradient>
          
          <linearGradient id="top-grad" x1="100" y1="170" x2="100" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#faf5f0" />
            <stop offset="100%" stopColor="#eaddcc" />
          </linearGradient>
          
          <linearGradient id="pants-grad" x1="100" y1="210" x2="100" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#292524" />
            <stop offset="100%" stopColor="#0c0a09" />
          </linearGradient>
          
          <filter id="blush-blur">
            <feGaussianBlur stdDeviation="1.5" />
          </filter>
        </defs>

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
          cy="212"
          rx="54"
          ry="5"
          fill="#000"
          opacity="0.18"
        />

        {/* Anime Character Group */}
        <g className="anime-body-group">
          {/* Back Hair (under shoulders, messy layers) */}
          <path
            d="M 50 90 Q 35 110, 48 135 C 55 145, 62 135, 66 125 C 68 115, 64 100, 64 90 Z"
            fill="url(#hair-grad)"
          />
          <path
            d="M 150 90 Q 165 110, 152 135 C 145 145, 138 135, 134 125 C 132 115, 136 100, 136 90 Z"
            fill="url(#hair-grad)"
          />
          <path
            d="M 52 120 C 44 140, 56 160, 68 165 C 72 155, 66 135, 66 120 Z"
            fill="url(#hair-grad)"
          />
          <path
            d="M 148 120 C 156 140, 144 160, 132 165 C 128 155, 134 135, 134 120 Z"
            fill="url(#hair-grad)"
          />

          {/* Shoulders & Torso - Slender outline & fill */}
          <path
            d="M 45 215 C 45 170, 70 148, 100 148 C 130 148, 155 170, 155 215 Z"
            fill="#ffe4e6"
            stroke="#090514"
            strokeWidth="3.5"
          />

          {/* Collarbones */}
          <path d="M 72 160 Q 88 164 95 162" stroke="#fda4af" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 128 160 Q 112 164 105 162" stroke="#fda4af" strokeWidth="2.2" strokeLinecap="round" />

          {/* Wrapped-bandage Crop Top */}
          <g>
            {/* Base top shape container */}
            <path
              d="M 54 174 C 54 174, 80 171, 100 171 C 120 171, 146 174, 146 174 L 148 200 C 148 200, 120 203, 100 203 C 80 203, 52 200, 52 200 Z"
              fill="url(#top-grad)"
              stroke="#090514"
              strokeWidth="3.5"
            />
            {/* Bandage wrap lines */}
            <path
              d="M 54 174 C 75 178, 125 178, 146 174"
              stroke="#090514"
              strokeWidth="2.2"
              fill="none"
            />
            <path
              d="M 53 182 C 85 187, 120 181, 147 186"
              stroke="#090514"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 52 191 C 78 188, 115 194, 148 191"
              stroke="#090514"
              strokeWidth="2"
              fill="none"
            />
            {/* Shading details */}
            <path d="M 53 182 L 147 184" stroke="#cbb59f" strokeWidth="1.2" fill="none" />
            <path d="M 52 191 L 148 192" stroke="#cbb59f" strokeWidth="1.2" fill="none" />
          </g>

          {/* Cute belly button (navel) */}
          <line x1="100" y1="205" x2="100" y2="208" stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round" />

          {/* Trousers (Dark black baggy high-waisted pants) */}
          <path
            d="M 46 211 C 55 210, 145 210, 154 211 L 157 218 L 43 218 Z"
            fill="url(#pants-grad)"
            stroke="#090514"
            strokeWidth="3.5"
          />

          {/* Lilac/Lavender Belt */}
          <path
            d="M 50 208 C 65 207, 135 207, 150 208 L 150 213 C 135 212, 65 212, 50 213 Z"
            fill="#d8b4fe"
            stroke="#090514"
            strokeWidth="2"
          />
          {/* Belt Loops */}
          <rect x="66" y="207" width="4" height="7" fill="#0c0a09" stroke="#090514" strokeWidth="1.2" />
          <rect x="130" y="207" width="4" height="7" fill="#0c0a09" stroke="#090514" strokeWidth="1.2" />

          {/* Belt Buckle (silver center) */}
          <rect x="92" y="205" width="16" height="9" rx="2" fill="#e2e8f0" stroke="#090514" strokeWidth="2.5" />
          <line x1="100" y1="205" x2="100" y2="214" stroke="#090514" strokeWidth="2" />

          {/* Neck */}
          <path
            d="M 88 128 L 88 152 Q 100 160 112 152 L 112 128 Z"
            fill="#ffe4e6"
            stroke="#090514"
            strokeWidth="3"
          />

          {/* Face */}
          <path
            d="M 66 94 C 66 122, 82 136, 100 136 C 118 136, 134 122, 134 94 C 134 70, 66 70, 66 94 Z"
            fill="#ffe4e6"
            stroke="#090514"
            strokeWidth="3.5"
          />

          {/* Rosy blush with soft Gaussian blur filter */}
          <ellipse cx="73" cy="116" rx="6" ry="3.5" fill="#fda4af" opacity="0.6" filter="url(#blush-blur)" />
          <ellipse cx="127" cy="116" rx="6" ry="3.5" fill="#fda4af" opacity="0.6" filter="url(#blush-blur)" />

          {/* Left Eyeball */}
          <circle cx="82" cy="100" r="11" fill="white" stroke="#090514" strokeWidth="2.5" />
          {/* Left Iris / Aqua Glow */}
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
            <circle cx="82" cy="100" r="8" fill="url(#eye-grad)" />
            <circle cx="82" cy="100" r="4.2" fill="#083344" />
            <circle cx="79.5" cy="97.2" r="2.8" fill="white" />
            <circle cx="84.5" cy="102" r="1.3" fill="white" />
          </g>
          {/* Eyelash */}
          <path d="M 70 96 C 75 91, 89 91, 94 96" stroke="#090514" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M 92 94 L 95 91" stroke="#090514" strokeWidth="2" strokeLinecap="round" />

          {/* Right Eyeball */}
          <circle cx="118" cy="100" r="11" fill="white" stroke="#090514" strokeWidth="2.5" />
          {/* Right Iris */}
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
            <circle cx="118" cy="100" r="8" fill="url(#eye-grad)" />
            <circle cx="118" cy="100" r="4.2" fill="#083344" />
            <circle cx="115.5" cy="97.2" r="2.8" fill="white" />
            <circle cx="120.5" cy="102" r="1.3" fill="white" />
          </g>
          {/* Eyelash */}
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

          {/* Nose */}
          <circle cx="100" cy="109" r="1.5" fill="#4c0519" />

          {/* Mouth */}
          <path
            className="mouth"
            d={
              isShy
                ? 'M 96 119 L 104 119'
                : isPeeking
                ? 'M 95 117 Q 100 123 105 117'
                : 'M 96 117 Q 100 121 104 117'
            }
            stroke="#090514"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Pink layered hair style */}
          <path d="M 64 80 Q 75 106 79 108 C 73 90, 68 82, 64 80 Z" fill="url(#hair-grad)" />
          <path d="M 78 72 Q 92 108 95 108 C 91 85, 84 76, 78 72 Z" fill="url(#hair-grad)" />
          <path d="M 122 72 Q 108 108 105 108 C 109 85, 116 76, 122 72 Z" fill="url(#hair-grad)" />
          <path d="M 136 80 Q 125 106 121 108 C 127 90, 132 82, 136 80 Z" fill="url(#hair-grad)" />

          {/* Messy side bangs/locks overlaying face */}
          <path d="M 60 84 Q 50 110 56 118 C 58 110, 62 96, 60 84 Z" fill="url(#hair-grad)" />
          <path d="M 140 84 Q 150 110 144 118 C 142 110, 138 96, 140 84 Z" fill="url(#hair-grad)" />

          {/* Center strands */}
          <path d="M 90 70 Q 100 95 102 96 C 98 85, 94 76, 90 70 Z" fill="url(#hair-grad)" />
          <path d="M 110 70 Q 100 95 98 96 C 102 85, 106 76, 110 70 Z" fill="url(#hair-grad)" />
          
          {/* Main top head hair silhouette with strands sticking out */}
          <path
            d="M 62 76 C 72 58, 100 52, 128 58 C 138 68, 143 82, 141 94 C 148 76, 132 60, 100 58 C 68 60, 56 76, 62 76 Z"
            fill="url(#hair-grad)"
            stroke="#090514"
            strokeWidth="1.5"
          />
          {/* Spikes sticking out at top/sides */}
          <path d="M 68 62 Q 54 50 66 56 Z" fill="url(#hair-grad)" stroke="#090514" strokeWidth="1.2" />
          <path d="M 132 62 Q 146 50 134 56 Z" fill="url(#hair-grad)" stroke="#090514" strokeWidth="1.2" />
          <path d="M 108 54 Q 116 38 112 50 Z" fill="url(#hair-grad)" stroke="#090514" strokeWidth="1.2" />

          {/* Curly Ahoge */}
          <path
            d="M 94 56 Q 103 40 100 58"
            stroke="#db2777"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 94 56 Q 103 40 100 58"
            stroke="#f472b6"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Bare Arms & Hands overlaying face */}
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
          {/* Bare Arm Outline */}
          <path
            d="M 22 178 Q 35 158 47 152"
            stroke="#090514"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bare Arm Skin Fill */}
          <path
            d="M 22 178 Q 35 158 47 152"
            stroke="#ffe4e6"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Hand Group */}
          <g transform="translate(45, 140)">
            <path
              d="M 2 15 C 2 7, 14 7, 14 15 Z"
              fill="#ffe4e6"
              stroke="#090514"
              strokeWidth="2.5"
            />
            {/* 4 fingers with gaps */}
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
          {/* Bare Arm Outline */}
          <path
            d="M 178 178 Q 165 158 153 152"
            stroke="#090514"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bare Arm Skin Fill */}
          <path
            d="M 178 178 Q 165 158 153 152"
            stroke="#ffe4e6"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Hand Group */}
          <g transform="translate(126, 140)">
            <path
              d="M 2 15 C 2 7, 14 7, 14 15 Z"
              fill="#ffe4e6"
              stroke="#090514"
              strokeWidth="2.5"
            />
            {/* 4 fingers with gaps */}
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
