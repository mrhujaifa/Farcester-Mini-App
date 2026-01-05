"use client";

import { useMiniApp } from "@neynar/react";

export function HomeTab() {
  const { actions, added } = useMiniApp();

  return (
    <div className="relative min-h-[100dvh] w-full  flex flex-col items-center justify-center overflow-hidden font-sans p-6 selection:bg-amber-500/30">
      {/* --- LAYERED LIGHTING SYSTEM --- */}
      {/* Dynamic Mesh Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[50%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[40%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Center Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />

      {/* --- MAIN CONTENT CARD --- */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Animated Badge with Glass Effect */}
        <div className="group cursor-default mb-10 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl transition-all hover:border-amber-500/50">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-black group-hover:text-amber-200 transition-colors">
              Welcome to FarRewards
            </span>
          </div>
        </div>

        {/* Hero Typography with Depth */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-7xl sm:text-8xl font-black text-white tracking-tighter leading-[0.85]">
            Far
            <span className="text-cyan-400 transition-all duration-700 hover:drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              Rewards
            </span>
          </h1>
          <p className="text-gray-500 text-sm sm:text-base font-medium tracking-[0.1em] uppercase">
            Beyond Social • Beyond Loyalty
          </p>
        </div>

        {/* Interactive Feature Cards (Subtle) */}
        <div className="grid grid-cols-2 gap-3 w-full mb-12">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm text-center">
            <p className="text-white font-bold text-lg leading-none">200+</p>
            <p className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">
              Early Users
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm text-center">
            <p className="text-white font-bold text-lg leading-none">
              ∞ Active
            </p>
            <p className="text-[9px] text-gray-500 uppercase mt-1 tracking-widest">
              Rewards Pool
            </p>
          </div>
        </div>

        {/* THE MAIN CTA BUTTON (THE CORE) */}
        <div className="relative w-full group">
          {/* Animated Glow Border */}
          <div
            className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-600 via-white/20 to-amber-600 blur-[2px] opacity-20 transition-all duration-1000 ${
              !added && "group-hover:opacity-100 group-hover:blur-[8px]"
            }`}
          />

          <button
            onClick={actions.addMiniApp}
            disabled={added}
            className={`relative w-full py-5 rounded-2xl font-black transition-all duration-500 overflow-hidden
              ${
                added
                  ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed shadow-none"
                  : "bg-white text-black hover:bg-amber-500 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.2)] active:scale-95"
              }
            `}
          >
            {/* Button Interior Reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-y-full group-hover:translate-y-full transition-transform duration-700 pointer-events-none" />

            <span className="relative z-10 text-base uppercase tracking-wider">
              {added ? "App Integrated" : "Launch in Farcaster"}
            </span>
          </button>
        </div>

        {/* Floating Tagline */}
        <div className="mt-12 flex items-center gap-4 opacity-30 group">
          <div className="h-[1px] w-8 bg-white transition-all group-hover:w-16" />
          <span className="text-[9px] uppercase tracking-[0.5em] text-white">
            Earn. Connect. Thrive.
          </span>
          <div className="h-[1px] w-8 bg-white transition-all group-hover:w-16" />
        </div>
      </div>

      {/* Grid Overlay for Professional Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#6538f6_1px,transparent_1px),linear-gradient(to_bottom,#6538f6_1px,transparent_1px)] bg-[size:30px_30px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" />
    </div>
  );
}
