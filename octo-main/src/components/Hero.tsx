"use client";

import { motion } from 'motion/react';
import { Shield, CloudLightning, FileText, Play, ArrowRight } from 'lucide-react';
import OSSimulator from './OSSimulator';

interface HeroProps {
  onStartBuilding: () => void;
  onWatchDemo: () => void;
}

export default function Hero({ onStartBuilding, onWatchDemo }: HeroProps) {
  return (
    <section className="w-full px-6 md:px-12 lg:px-20 pt-16 pb-32 md:pt-24 md:pb-48 max-w-[1400px] mx-auto select-none" id="octo-hero-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
        
        {/* LEFT SIDE: Deeply Spacious typography block */}
        <div className="lg:col-span-5 flex flex-col gap-12 md:gap-16">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8"
          >
            {/* Extremely Large Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl font-bold text-stone-950 tracking-tight leading-[1.05] font-sans">
              The platform where you build AI workers to run your entire business.
            </h1>
            
            {/* Beautiful, airy subheading */}
            <p className="text-lg sm:text-xl text-stone-500 font-light leading-relaxed max-w-lg">
              Build AI workers for operations, finance, support, marketing, customers, suppliers, and everything else your business needs.
            </p>
          </motion.div>

          {/* Sizable minimalist button layout */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5"
          >
            <button
              type="button"
              onClick={onStartBuilding}
              className="bg-stone-950 hover:bg-stone-800 text-white font-medium px-8 py-4.5 rounded-xl text-base transition-all active:scale-[0.98] shadow-lg shadow-stone-950/5 flex items-center justify-center gap-3 cursor-pointer group"
              id="hero-start-btn"
            >
              Start Building
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={onWatchDemo}
              className="bg-white border border-stone-200 hover:bg-stone-50/80 text-stone-950 font-medium px-8 py-4.5 rounded-xl text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xs cursor-pointer"
              id="hero-demo-btn"
            >
              <Play className="w-4 h-4 fill-stone-950 text-stone-950" />
              Watch Demo
            </button>
          </motion.div>

          {/* Simple, tiny corporate trust elements ONLY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="pt-10 border-t border-stone-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-stone-400 text-xs font-mono tracking-wide">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-stone-400" />
                <span>Private by default</span>
              </div>
              <div className="flex items-center gap-2">
                <CloudLightning className="w-3.5 h-3.5 text-stone-400" />
                <span>Connect your apps</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-stone-400" />
                <span>Upload company files</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* RIGHT SIDE: Massive Real AI OS Simulator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.99, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 w-full"
        >
          <OSSimulator />
        </motion.div>

      </div>
    </section>
  );
}
