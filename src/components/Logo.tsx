import React from 'react';

interface LogoProps {
  variant?: 'full' | 'compact' | 'emblem' | 'wordmark';
  theme?: 'dark' | 'light';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'dark',
  className = '',
}) => {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#EBE4D1' : '#0E3524';
  const accentColor = isDark ? '#C4283D' : '#E6BD83';
  const strokeColor = isDark ? '#EBE4D1' : '#0E3524';

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
        <svg
          viewBox="0 0 80 80"
          className="w-8 h-8 shrink-0"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M40 6L41 74M10 24L70 54M12 58L68 22M25 10L54 70"
            stroke="#C4283D"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          <circle cx="40" cy="40" r="6" fill="#C4283D" />
        </svg>
        <span className="font-display font-bold tracking-wider text-xl uppercase" style={{ color: textColor }}>
          EMPATHY
        </span>
      </div>
    );
  }

  if (variant === 'emblem') {
    return (
      <svg
        viewBox="0 0 260 200"
        className={`select-none ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Empathy Speciality Coffee Turtle Surfer Illustration"
      >
        <g transform="translate(0, 10)">
          <circle cx="82" cy="142" r="24" stroke={isDark ? '#EBE4D1' : '#1E2420'} strokeWidth="4.5" fill={isDark ? '#0E3524' : '#F9F8F4'} />
          <circle cx="82" cy="142" r="20" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.5" />
          <path d="M82 118L82 166M58 142L106 142M65 125L99 159M65 159L99 125" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.4" />
          <circle cx="166" cy="142" r="24" stroke={isDark ? '#EBE4D1' : '#1E2420'} strokeWidth="4.5" fill={isDark ? '#0E3524' : '#F9F8F4'} />
          <circle cx="166" cy="142" r="20" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.5" />
          <path d="M166 118L166 166M142 142L190 142M149 125L183 159M149 159L183 125" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.4" />
          <path d="M82 142L102 95L145 102L166 142M102 95L94 86L86 90" stroke="#D9B44A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M122 140L102 95" stroke="#D9B44A" strokeWidth="3" strokeLinecap="round" />
          <path d="M112 50C106 48 98 51 96 56C94 61 102 64 109 66C113 68 115 76 114 84L126 86C128 74 126 54 112 50Z" fill="#7D9B76" stroke="#243829" strokeWidth="2" />
          <circle cx="103" cy="54" r="2" fill="#18261C" />
          <path d="M116 78C108 79 99 83 95 88C98 92 107 90 118 87" fill="#7D9B76" stroke="#243829" strokeWidth="2" />
          <path d="M124 58C146 56 172 74 174 106C152 112 124 108 122 86C120 72 121 62 124 58Z" fill="#3B2B22" stroke="#241A14" strokeWidth="2" />
          <path d="M128 65C142 64 152 72 154 84C142 86 130 82 128 65Z" fill="#7E573B" />
          <path d="M158 74C165 80 169 91 168 102C160 103 156 96 156 86L158 74Z" fill="#7E573B" />
          <path d="M127 86C138 88 150 90 152 103C140 105 128 100 127 86Z" fill="#8C6243" />
          <path d="M36 112C36 101 84 96 134 99C184 102 224 111 224 119C224 127 182 134 132 132C82 130 36 123 36 112Z" fill="#C4283D" stroke="#8F1929" strokeWidth="2" />
          <path d="M38 113C95 111 165 115 222 119" stroke="#7A1321" strokeWidth="2" />
          <path d="M126 100L110 131M142 100L156 132" stroke="#1B1E1C" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </svg>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <svg viewBox="0 0 100 100" className="w-10 h-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 8L52 92M12 30L88 68M15 72L85 28M32 12L68 88" stroke={accentColor} strokeWidth="7.5" strokeLinecap="round" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-display font-bold tracking-wider text-xl" style={{ color: textColor }}>
            EMPATHY
          </span>
          <span className="text-[10px] font-semibold tracking-[0.22em] uppercase mt-0.5" style={{ color: isDark ? '#D6CEBF' : '#3C5A4B' }}>
            SPECIALITY COFFEE
          </span>
        </div>
      </div>
    );
  }

  // Full default variant
  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox="0 0 420 340"
        className="w-full max-w-[360px] h-auto overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Empathy Speciality Coffee — Qidfa Fujairah"
      >
        <g transform="translate(15, 5)">
          <path d="M72 6L96 142M12 48L148 96M24 114L134 28M46 14L112 132" stroke={accentColor} strokeWidth="10" strokeLinecap="round" />
          <circle cx="80" cy="72" r="11" fill={accentColor} />
        </g>
        <g transform="rotate(-11 210 105)">
          <text x="92" y="112" fill={textColor} fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="52" letterSpacing="3">
            EMPATHY
          </text>
          <text x="96" y="140" fill={textColor} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600" fontSize="19" letterSpacing="3.5">
            SPECIALITY
          </text>
          <text x="122" y="166" fill={textColor} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="600" fontSize="19" letterSpacing="3.5">
            COFFEE
          </text>
        </g>
        <path d="M175 152 Q 185 144, 195 152 T 215 152 T 235 152 T 255 152 T 275 152" stroke={strokeColor} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        <g transform="translate(82, 148)">
          <circle cx="76" cy="142" r="25" stroke={isDark ? '#EBE4D1' : '#1E2420'} strokeWidth="4.5" fill={isDark ? '#0E3524' : '#F9F8F4'} />
          <circle cx="76" cy="142" r="20" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.5" />
          <path d="M76 117L76 167M51 142L101 142M58 124L94 160M58 160L94 124" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.5" />
          <circle cx="164" cy="142" r="25" stroke={isDark ? '#EBE4D1' : '#1E2420'} strokeWidth="4.5" fill={isDark ? '#0E3524' : '#F9F8F4'} />
          <circle cx="164" cy="142" r="20" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.5" />
          <path d="M164 117L164 167M139 142L189 142M146 124L182 160M146 160L182 124" stroke={isDark ? '#EBE4D1' : '#3A443E'} strokeWidth="1.5" />
          <path d="M76 142L98 92L144 100L164 142M98 92L90 82L80 86" stroke="#D9B44A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M110 42C102 40 94 44 92 49C90 54 98 58 106 60C111 62 113 72 112 82L124 84C126 70 124 46 110 42Z" fill="#7D9B76" stroke="#243829" strokeWidth="2" />
          <circle cx="99" cy="47" r="2.2" fill="#18261C" />
          <path d="M114 73C105 74 96 79 91 85C95 89 105 87 116 83" fill="#7D9B76" stroke="#243829" strokeWidth="2" />
          <path d="M122 50C146 48 174 68 176 102C152 108 122 104 120 80C118 66 119 55 122 50Z" fill="#3B2B22" stroke="#241A14" strokeWidth="2" />
          <path d="M126 58C142 57 152 66 154 79C142 81 128 76 126 58Z" fill="#7E573B" />
          <path d="M158 68C166 74 170 86 169 98C160 99 156 91 156 80L158 68Z" fill="#7E573B" />
          <path d="M125 80C136 82 150 85 152 99C139 101 126 96 125 80Z" fill="#8C6243" />
          <path d="M24 109C24 97 76 91 130 95C184 99 228 108 228 117C228 126 182 133 128 131C74 129 24 121 24 109Z" fill="#C4283D" stroke="#8F1929" strokeWidth="2" />
          <path d="M26 110C88 108 164 112 226 117" stroke="#7A1321" strokeWidth="2.2" />
          <path d="M122 96L105 130M140 96L155 131" stroke="#1B1E1C" strokeWidth="4" strokeLinecap="round" />
        </g>
        <text x="292" y="225" fill={textColor} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="500" fontSize="16" letterSpacing="1.5">
          QIDFA
        </text>
        <text x="292" y="246" fill={textColor} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="500" fontSize="16" letterSpacing="1.5">
          FUJAIRAH
        </text>
        <text x="18" y="292" fill={textColor} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="400" fontSize="14" letterSpacing="0.5">
          come and enjoy
        </text>
        <text x="42" y="310" fill={textColor} fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="400" fontSize="14" letterSpacing="0.5">
          your coffee
        </text>
        <text x="44" y="328" fill={isDark ? '#E6BD83' : '#C4283D'} fontFamily="JetBrains Mono, monospace" fontWeight="600" fontSize="14" letterSpacing="1">
          7AM-12AM
        </text>
      </svg>
    </div>
  );
};
