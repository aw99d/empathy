import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onEnterMenu: () => void;
  location?: string;
  hours?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnterMenu,
  location = 'QIDFA · FUJAIRAH',
  hours = '7AM - 12AM',
}) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onClick={onEnterMenu}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0E3524] text-[#EBE4D1] px-6 py-10 overflow-hidden cursor-pointer select-none"
    >
      {/* Background radial glows */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #C4283D 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-28 -right-24 w-96 h-96 rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, #E6BD83 0%, transparent 70%)' }}
      />

      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md flex items-center justify-between text-xs tracking-widest uppercase text-[#EBE4D1]/70 font-medium"
      >
        <span>{location}</span>
        <span className="font-mono-tabular">{hours}</span>
      </motion.div>

      {/* Centered Brand Artwork */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm flex flex-col items-center my-auto"
      >
        <Logo variant="full" theme="dark" />
      </motion.div>

      {/* Bottom Button Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="w-full max-w-xs flex flex-col items-center gap-2"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEnterMenu();
          }}
          className="w-full py-3 px-6 rounded-2xl bg-[#EBE4D1] hover:bg-[#F9F8F4] text-[#0E3524] text-xs uppercase tracking-widest font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
        >
          Explore Menu
        </button>
        <p className="text-[11px] text-[#EBE4D1]/50 tracking-wider">Tap anywhere to enter</p>
      </motion.div>
    </motion.div>
  );
};
