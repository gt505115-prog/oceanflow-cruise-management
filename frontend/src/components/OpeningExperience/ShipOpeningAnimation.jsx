import React, { useState, useEffect } from 'react';
import { Compass, FastForward, Anchor } from 'lucide-react';

export default function ShipOpeningAnimation({ onComplete }) {
  const [phase, setPhase] = useState(0); // 0: Enter, 1: Explode, 2: Assemble, 3: Logo, 4: Transition
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase timings:
    // 0 -> 0.8s: Intro view
    // 1 -> 2.4s: Exploded separation
    // 2 -> 3.6s: Reassembly
    // 3 -> 4.8s: OceanFlow brand reveal
    // 4 -> 5.4s: Smooth fadeout to dashboard
    const t0 = setTimeout(() => setPhase(1), 800);
    const t1 = setTimeout(() => setPhase(2), 2400);
    const t2 = setTimeout(() => setPhase(3), 3600);
    const t3 = setTimeout(() => setPhase(4), 4800);
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5400);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
    }, 108);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onComplete) onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearInterval(progressInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  const handleSkip = () => {
    if (onComplete) onComplete();
  };

  const isExploded = phase === 1;
  const isLogo = phase >= 3;
  const isFadingOut = phase === 4;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030816] text-slate-100 transition-opacity duration-700 select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ocean depth background gradient & hydro grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0d224d]/40 via-[#061129]/80 to-[#02050e] pointer-events-none" />
      
      {/* Subtle sonar coordinate grid lines */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 180, 216, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 180, 216, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Top bar with system classification and Skip button */}
      <div className="absolute top-6 left-8 right-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-ocean-300 animate-ping" />
          <span className="text-xs font-mono tracking-widest text-ocean-300/80 uppercase">
            OceanFlow Operational Architecture v2.6
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-ocean-900/80 hover:bg-ocean-800 border border-ocean-500/30 hover:border-ocean-400 text-xs font-medium text-ocean-200 hover:text-white transition-all shadow-lg backdrop-blur-md cursor-pointer group"
          title="Press Esc to Skip"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          <span className="text-[10px] text-slate-400 font-mono ml-1 px-1.5 py-0.5 rounded bg-ocean-950/60 border border-white/10">Esc</span>
        </button>
      </div>

      {/* 3D Exploded-View Stage */}
      <div className="relative w-full max-w-4xl h-[420px] flex items-center justify-center ship-viewport-3d">
        <div
          className="relative w-[680px] h-[320px] ship-stage-3d flex items-center justify-center"
          style={{
            transform: isExploded
              ? 'rotateX(38deg) rotateY(-18deg) rotateZ(4deg) scale(0.95)'
              : 'rotateX(15deg) rotateY(-4deg) rotateZ(0deg) scale(1)',
            transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Layer 4: Navigation Bridge & Radar Funnel */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out"
            style={{
              transform: isExploded ? 'translateY(-110px) translateZ(80px)' : 'translateY(-34px)',
            }}
          >
            <div className="relative w-[480px]">
              <svg viewBox="0 0 480 70" className="w-full drop-shadow-[0_10px_15px_rgba(0,180,216,0.25)]">
                {/* Radar Mast & Bridge Wing */}
                <path d="M190 35 L200 8 L204 8 L210 35 Z" fill="#48CAE4" opacity="0.9" />
                <circle cx="202" cy="6" r="3" fill="#00F0FF" />
                <path d="M185 18 L219 18" stroke="#90E0EF" strokeWidth="2" strokeLinecap="round" />
                
                {/* Signature OceanFlow Aerodynamic Funnel */}
                <path d="M260 35 L285 10 L315 10 L310 35 Z" fill="#0077B6" />
                <path d="M285 10 L315 10 L318 16 L288 16 Z" fill="#00B4D8" />
                {/* Funnel Emblem Stripe */}
                <path d="M272 23 L298 23" stroke="#FEFCFB" strokeWidth="3" strokeLinecap="round" />

                {/* Bridge Deck Structure */}
                <path
                  d="M60 55 L90 32 L360 32 L410 55 Z"
                  fill="#11254B"
                  stroke="#00B4D8"
                  strokeWidth="1.5"
                />
                {/* Bridge Panoramic Windows */}
                <path
                  d="M95 38 L140 38 L142 46 L95 46 Z M148 38 L200 38 L200 46 L148 46 Z M206 38 L260 38 L258 46 L206 46 Z"
                  fill="#00F0FF"
                  opacity="0.85"
                />
              </svg>
              {isExploded && (
                <div className="absolute -right-24 top-2 flex items-center gap-2 animate-fade-in">
                  <div className="w-8 h-px bg-ocean-300" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ocean-300 bg-ocean-950/80 px-2 py-0.5 rounded border border-ocean-500/40 whitespace-nowrap">
                    Deck 12–14: Navigation Bridge & Funnel
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Layer 3: Lido Deck & Resort Area */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out"
            style={{
              transform: isExploded ? 'translateY(-35px) translateZ(40px)' : 'translateY(-14px)',
            }}
          >
            <div className="relative w-[560px]">
              <svg viewBox="0 0 560 65" className="w-full drop-shadow-[0_8px_12px_rgba(0,119,182,0.2)]">
                {/* Lido Deck Promenade Floor */}
                <path
                  d="M40 45 L80 18 L460 18 L510 45 Z"
                  fill="#173366"
                  stroke="#48CAE4"
                  strokeWidth="1.2"
                />
                {/* Twin Swimming Pools with Water Shimmer */}
                <rect x="170" y="24" width="70" height="15" rx="3" fill="#00B4D8" opacity="0.9" />
                <rect x="270" y="24" width="70" height="15" rx="3" fill="#00B4D8" opacity="0.9" />
                {/* Glass Sunscreen Railings */}
                <path d="M85 18 L455 18" stroke="#ADE8F4" strokeWidth="2" strokeDasharray="6 3" />
                <path d="M45 45 L505 45" stroke="#ADE8F4" strokeWidth="2" />
              </svg>
              {isExploded && (
                <div className="absolute -left-28 top-2 flex items-center gap-2 animate-fade-in">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ocean-200 bg-ocean-950/80 px-2 py-0.5 rounded border border-ocean-400/40 whitespace-nowrap">
                    Deck 10–11: Lido Aqua Resort
                  </span>
                  <div className="w-8 h-px bg-ocean-300" />
                </div>
              )}
            </div>
          </div>

          {/* Layer 2: Stateroom Promenade & Balconies */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out"
            style={{
              transform: isExploded ? 'translateY(40px)' : 'translateY(12px)',
            }}
          >
            <div className="relative w-[620px]">
              <svg viewBox="0 0 620 75" className="w-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.5)]">
                {/* Main Accommodation Tier */}
                <path
                  d="M20 52 L65 15 L535 15 L590 52 Z"
                  fill="#0D1D3A"
                  stroke="#0077B6"
                  strokeWidth="1.5"
                />
                {/* Balcony Cabin Grid */}
                <g stroke="#48CAE4" strokeWidth="1" opacity="0.75">
                  <line x1="110" y1="22" x2="110" y2="46" />
                  <line x1="150" y1="22" x2="150" y2="46" />
                  <line x1="190" y1="22" x2="190" y2="46" />
                  <line x1="230" y1="22" x2="230" y2="46" />
                  <line x1="270" y1="22" x2="270" y2="46" />
                  <line x1="310" y1="22" x2="310" y2="46" />
                  <line x1="350" y1="22" x2="350" y2="46" />
                  <line x1="390" y1="22" x2="390" y2="46" />
                  <line x1="430" y1="22" x2="430" y2="46" />
                  <line x1="470" y1="22" x2="470" y2="46" />
                </g>
                {/* Tender Boats / Lifeboats Along Promenade */}
                <rect x="180" y="44" width="40" height="7" rx="3" fill="#F59E0B" />
                <rect x="240" y="44" width="40" height="7" rx="3" fill="#F59E0B" />
                <rect x="300" y="44" width="40" height="7" rx="3" fill="#F59E0B" />
                <rect x="360" y="44" width="40" height="7" rx="3" fill="#F59E0B" />
              </svg>
              {isExploded && (
                <div className="absolute -right-28 top-3 flex items-center gap-2 animate-fade-in">
                  <div className="w-8 h-px bg-ocean-300" />
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ocean-200 bg-ocean-950/80 px-2 py-0.5 rounded border border-ocean-400/40 whitespace-nowrap">
                    Deck 5–9: Staterooms & Promenade
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Layer 1: Keel, Hull & Hydrodynamic Propulsion */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out"
            style={{
              transform: isExploded ? 'translateY(115px) translateZ(-60px)' : 'translateY(40px)',
            }}
          >
            <div className="relative w-[660px]">
              <svg viewBox="0 0 660 90" className="w-full drop-shadow-[0_15px_30px_rgba(0,180,216,0.2)]">
                {/* Hydrodynamic Deep Blue Main Hull */}
                <path
                  d="M10 20 L50 20 L580 20 L640 38 Q610 80 480 82 L120 82 Q30 75 10 20 Z"
                  fill="url(#hullGradient)"
                  stroke="#00B4D8"
                  strokeWidth="1.5"
                />
                {/* Bulbous Bow Silhouette at Stern/Bow */}
                <path d="M640 38 Q655 52 630 65" stroke="#00F0FF" strokeWidth="2" fill="none" />
                {/* Stabilizer Fin Projection */}
                <path d="M320 78 L340 90 L365 78 Z" fill="#0096C7" stroke="#48CAE4" strokeWidth="1" />
                {/* Dual Azipod Thruster Representation */}
                <circle cx="150" cy="85" r="4" fill="#00F0FF" />
                <circle cx="190" cy="85" r="4" fill="#00F0FF" />
                
                <defs>
                  <linearGradient id="hullGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#08142C" />
                    <stop offset="50%" stopColor="#0B1C40" />
                    <stop offset="100%" stopColor="#030A19" />
                  </linearGradient>
                </defs>
              </svg>
              {isExploded && (
                <div className="absolute -left-28 bottom-2 flex items-center gap-2 animate-fade-in">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ocean-300 bg-ocean-950/80 px-2 py-0.5 rounded border border-ocean-500/40 whitespace-nowrap">
                    Deck 1–4: Hydro-Hull & Azipods
                  </span>
                  <div className="w-8 h-px bg-ocean-300" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Reveal Overlay (Phase 3+) */}
      <div
        className={`relative z-30 flex flex-col items-center justify-center transition-all duration-700 ${
          isLogo ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-ocean-600 via-ocean-400 to-ocean-200 p-0.5 shadow-ocean-glow flex items-center justify-center">
            <div className="w-full h-full bg-ocean-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-7 h-7 text-ocean-300 animate-spin-slow" />
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold tracking-tight font-['Space_Grotesk'] text-white">
              OCEAN<span className="text-ocean-300">FLOW</span>
            </h1>
            <span className="text-[10px] font-mono tracking-[0.25em] text-ocean-300/80 uppercase">
              Maritime SaaS Operations
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-1 max-w-md text-center">
          Cruise Activity & Service Management System
        </p>
      </div>

      {/* Subtle Progress Bar */}
      <div className="absolute bottom-6 left-12 right-12 flex flex-col items-center gap-2 z-20 max-w-md mx-auto">
        <div className="w-full h-1 bg-ocean-900/80 rounded-full overflow-hidden border border-ocean-800">
          <div
            className="h-full bg-gradient-to-r from-ocean-500 via-ocean-300 to-teal-400 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="w-full flex justify-between text-[11px] font-mono text-ocean-400/70">
          <span>{isExploded ? 'Exploded Deck Analysis' : isLogo ? 'System Calibrated' : 'Synthesizing Architecture'}</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}
