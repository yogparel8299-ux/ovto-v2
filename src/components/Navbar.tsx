"use client";

import { motion } from 'motion/react';

interface NavbarProps {
  onStartBuilding: () => void;
  onLogin: () => void;
  onPricingClick?: () => void;
  onLogoClick?: () => void;
}

export default function Navbar({ onStartBuilding, onLogin, onPricingClick, onLogoClick }: NavbarProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full border-b border-stone-200/40 bg-white sticky top-0 z-50 px-6 md:px-12 py-6"
      id="octo-navbar"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={onLogoClick}
          className="flex items-center gap-3 select-none group cursor-pointer"
        >
          <div className="relative w-8 h-8 flex items-center justify-center border-2 border-stone-950 rounded-lg group-hover:scale-105 transition-transform duration-300">
            {/* Minimal Geometric logo node representing an octopus node or AI system core */}
            <div className="w-2.5 h-2.5 bg-stone-950 rounded-full transition-all duration-300 group-hover:w-3.5 group-hover:h-3.5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <span className="font-sans font-semibold text-2xl tracking-tight text-stone-950">
            octo
          </span>
        </div>

        {/* Action Links */}
        <div className="flex items-center gap-8 font-medium">
          {onPricingClick && (
            <button 
              type="button" 
              onClick={onPricingClick}
              className="text-stone-600 hover:text-stone-955 transition-colors text-sm font-sans relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-stone-950 after:transition-all hover:after:w-full cursor-pointer py-1"
            >
              Pricing
            </button>
          )}

          <button 
            type="button" 
            onClick={onLogin}
            className="text-stone-600 hover:text-stone-950 transition-colors text-sm font-sans relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-stone-950 after:transition-all hover:after:w-full cursor-pointer py-1"
            id="nav-login-btn"
          >
            Login
          </button>
          
          <button 
            type="button" 
            onClick={onStartBuilding}
            className="bg-stone-950 text-white hover:bg-stone-800 active:scale-[0.98] transition-all px-5 py-2.5 rounded-lg text-sm font-sans shadow-sm tracking-wide cursor-pointer animate-pulse"
            id="nav-start-btn"
          >
            Start Building
          </button>
        </div>
      </div>
    </motion.header>
  );
}
