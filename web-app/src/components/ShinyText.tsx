import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  variant?: "default" | "onBlue";
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = '', variant = "default" }) => {
  const animationDuration = `${speed}s`;

  const baseClass = variant === "onBlue" ? "text-white drop-shadow-[0_1px_1px_rgba(255,255,255,0.35)]" : "text-[#b5b5b5a4]";
  const gradient = variant === "onBlue"
    ? 'linear-gradient(120deg, rgba(255,255,255,0) 45%, rgba(255,255,255,0.95) 52%, rgba(255,255,255,0) 59%)'
    : 'linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 60%)';

  return (
    <div
      className={`${baseClass} bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage: gradient,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        // Keep text visible while overlaying highlight for better contrast on dark/blue backgrounds
        color: variant === "onBlue" ? undefined : undefined,
        textShadow: variant === "onBlue" ? '0 0.6px 0.6px rgba(0,0,0,0.06)' : undefined,
        animationDuration: animationDuration
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;

// tailwind.config.js
// module.exports = {
//   theme: {
//     extend: {
//       keyframes: {
//         shine: {
//           '0%': { 'background-position': '100%' },
//           '100%': { 'background-position': '-100%' },
//         },
//       },
//       animation: {
//         shine: 'shine 5s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// };
