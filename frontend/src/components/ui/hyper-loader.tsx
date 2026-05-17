'use client';

import React from 'react';
import { Cpu, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HyperLoaderProps {
  text?: string;
  subtext?: string;
  className?: string;
  theme?: 'dark' | 'light';
}

export function HyperLoader({
  text = 'Processing Request',
  subtext = 'Synchronizing with neural pathways',
  className,
  theme = 'dark',
}: HyperLoaderProps) {
  const isDark = theme === 'dark';
  
  // Refined Color Grading
  const bgColor = isDark ? 'bg-[#050505]' : 'bg-[#FDFDFD]';
  const primaryColor = isDark ? '#a78b71' : '#000000'; // Neural Gold in dark mode
  const textColor = isDark ? 'text-white' : 'text-black';
  const mutedColor = isDark ? 'text-white/40' : 'text-gray-400';
  const barBg = isDark ? 'bg-white/10' : 'bg-gray-100';
  const barFill = isDark ? 'bg-[#a78b71]' : 'bg-black';

  return (
    <div className={cn(`min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center ${bgColor}`, className)}>
      <style>{`
        .loader-wrapper {
          --primary-color: ${primaryColor};
        }
        
        .speeder-loader {
          position: absolute;
          top: 50%;
          margin-left: -50px;
          left: 50%;
          animation: speeder 0.4s linear infinite;
          z-index: 10;
        }

        .speeder-loader > span {
          height: 5px;
          width: 35px;
          background: var(--primary-color);
          position: absolute;
          top: -19px;
          left: 60px;
          border-radius: 2px 10px 1px 0;
        }

        .speeder-base span {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-right: 100px solid var(--primary-color);
          border-bottom: 6px solid transparent;
        }

        .speeder-base span:before {
          content: "";
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: var(--primary-color);
          position: absolute;
          right: -110px;
          top: -16px;
        }

        .speeder-base span:after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-top: 0 solid transparent;
          border-right: 55px solid var(--primary-color);
          border-bottom: 16px solid transparent;
          top: -16px;
          right: -98px;
        }

        .speeder-face {
          position: absolute;
          height: 12px;
          width: 20px;
          background: var(--primary-color);
          border-radius: 20px 20px 0 0;
          transform: rotate(-40deg);
          right: -125px;
          top: -15px;
        }

        .speeder-face:after {
          content: "";
          height: 12px;
          width: 12px;
          background: var(--primary-color);
          right: 4px;
          top: 7px;
          position: absolute;
          transform: rotate(40deg);
          transform-origin: 50% 50%;
          border-radius: 0 0 0 2px;
        }

        .speeder-loader > span > span:nth-child(1),
        .speeder-loader > span > span:nth-child(2),
        .speeder-loader > span > span:nth-child(3),
        .speeder-loader > span > span:nth-child(4) {
          width: 30px;
          height: 1px;
          background: var(--primary-color);
          position: absolute;
          animation: fazer1 0.2s linear infinite;
        }

        .speeder-loader > span > span:nth-child(2) {
          top: 3px;
          animation: fazer2 0.4s linear infinite;
        }

        .speeder-loader > span > span:nth-child(3) {
          top: 1px;
          animation: fazer3 0.4s linear infinite;
          animation-delay: -1s;
        }

        .speeder-loader > span > span:nth-child(4) {
          top: 4px;
          animation: fazer4 1s linear infinite;
          animation-delay: -1s;
        }

        @keyframes fazer1 {
          0% { left: 0; }
          100% { left: -80px; opacity: 0; }
        }
        @keyframes fazer2 {
          0% { left: 0; }
          100% { left: -100px; opacity: 0; }
        }
        @keyframes fazer3 {
          0% { left: 0; }
          100% { left: -50px; opacity: 0; }
        }
        @keyframes fazer4 {
          0% { left: 0; }
          100% { left: -150px; opacity: 0; }
        }

        @keyframes speeder {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -3px) rotate(-1deg); }
          20% { transform: translate(-2px, 0px) rotate(1deg); }
          30% { transform: translate(1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 3px) rotate(-1deg); }
          60% { transform: translate(-1px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-2px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }

        .longfazers {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .longfazers span {
          position: absolute;
          height: 2px;
          width: 20%;
          background: var(--primary-color);
          opacity: ${isDark ? '0.15' : '0.1'};
        }

        .longfazers span:nth-child(1) {
          top: 20%;
          animation: lf 0.6s linear infinite;
          animation-delay: -5s;
        }

        .longfazers span:nth-child(2) {
          top: 40%;
          animation: lf2 0.8s linear infinite;
          animation-delay: -1s;
        }

        .longfazers span:nth-child(3) {
          top: 60%;
          animation: lf3 0.6s linear infinite;
        }

        .longfazers span:nth-child(4) {
          top: 80%;
          animation: lf4 0.5s linear infinite;
          animation-delay: -3s;
        }

        @keyframes lf { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf3 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }
        @keyframes lf4 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }

        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: ${isDark ? '0.04' : '0.03'};
        }

        @keyframes progress-bounce {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
        
        .animate-progress-bounce {
          animation: progress-bounce 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background Texture */}
      <div className="absolute inset-0 noise-bg pointer-events-none mix-blend-overlay"></div>

      {/* Long Fazers Background */}
      <div className="longfazers loader-wrapper">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Loader Component Container */}
      <div className="relative w-full max-w-2xl h-[300px] sm:h-[400px] flex items-center justify-center loader-wrapper">
        <div className="speeder-loader scale-75 sm:scale-100">
          <span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </span>
          <div className="speeder-base">
            <span></span>
            <div className="speeder-face"></div>
          </div>
        </div>
      </div>

      {/* Content Overlay */}
      <div className="z-20 text-center mt-0 sm:mt-8 space-y-5 px-4 relative">
        <h1 className={cn("font-display text-3xl sm:text-4xl tracking-tight uppercase animate-pulse", textColor)}>
          {text}
        </h1>
        <p className={cn("font-sans font-medium tracking-[0.25em] uppercase text-[10px] sm:text-xs", mutedColor)}>
          {subtext}
        </p>

        {/* Progress Bar Mockup */}
        <div className={cn("w-48 sm:w-64 h-1 rounded-full mx-auto mt-12 overflow-hidden relative shadow-inner", barBg)}>
          <div className={cn("h-full w-1/3 animate-progress-bounce rounded-full", barFill)}></div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-6 sm:bottom-12 left-6 sm:left-12 flex flex-col items-start space-y-3 opacity-70">
        <div className="flex items-center space-x-3 text-[10px] sm:text-xs font-sans">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></span>
          <span className={cn("font-bold tracking-widest", textColor)}>SYSTEMS NOMINAL</span>
        </div>
        <div className={cn("text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.2em]", mutedColor)}>
          X-RAY DELTA 4.0 // VECTOR PROTOCOL
        </div>
      </div>

      <div className="absolute top-6 sm:top-12 right-6 sm:right-12 text-right opacity-70">
        <Cpu className={cn("w-5 h-5 sm:w-6 sm:h-6 mb-3 ml-auto", textColor)} />
        <div className={cn("text-[9px] sm:text-[10px] font-sans font-bold uppercase tracking-[0.2em]", textColor)}>
          LATENCY: 14ms
        </div>
      </div>

      {/* Branding */}
      <div className="absolute top-6 sm:top-12 left-6 sm:left-12">
        <div className="flex items-center space-x-4 group cursor-pointer">
          <div className={cn("w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110", isDark ? 'bg-white' : 'bg-black')}>
            <Zap className={cn("w-4 h-4 sm:w-5 sm:h-5", isDark ? 'text-black' : 'text-white')} />
          </div>
          <span className={cn("font-display text-lg sm:text-xl font-bold tracking-tight", textColor)}>KINMEL</span>
        </div>
      </div>

    </div>
  );
}
