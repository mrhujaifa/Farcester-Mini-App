import { useState, useEffect } from "react";
import {
  Rocket,
  Bell,
  Twitter,
  Disc as Discord,
  Zap,
  ArrowRightLeft,
} from "lucide-react";
import { useMiniApp } from "@neynar/react";

export function SwapComing() {
  const [timeLeft, setTimeLeft] = useState({
    days: 5,
    hours: 5,
    mins: 45,
    secs: 10,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { actions, added } = useMiniApp();

  return (
    <div className="relative   flex items-center justify-center overflow-hidden font-sans text-white px-4 py-10">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-5%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-600/30 rounded-full blur-[100px] md:blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-600/20 rounded-full blur-[100px] md:blur-[150px] animate-pulse delay-1000"></div>

      {/* Floating Decorative Icons (Mobile Hidden for Cleanliness) */}
      <div className="absolute hidden lg:block top-20 left-20 animate-bounce-slow opacity-20">
        <Zap size={48} className="text-yellow-400" />
      </div>
      <div className="absolute hidden lg:block bottom-20 right-20 animate-bounce-slow opacity-20 delay-500">
        <ArrowRightLeft size={48} className="text-blue-400" />
      </div>

      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 mb-6 backdrop-blur-xl animate-fade-in">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-purple-300 uppercase">
            System Protocol 2.0
          </span>
        </div>

        {/* Hero Section */}
        <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-center leading-[1.1]">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            $FR to $DEGEN
          </span>
          <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Swap Protocol
          </span>
        </h1>

        <p className="text-gray-400 text-sm md:text-lg max-w-lg mx-auto mb-10 text-center leading-relaxed px-4">
          The next-gen liquidity bridge is almost here. Swap $FR for $DEGEN with
          <span className="text-white font-semibold"> zero slippage</span>.
        </p>

        {/* Countdown Grid - Responsive Fix */}
        <div className="grid grid-cols-4 gap-3 md:gap-6 mb-12 w-full max-w-md md:max-w-xl">
          {[
            { label: "Days", val: timeLeft.days },
            { label: "Hrs", val: timeLeft.hours },
            { label: "Mins", val: timeLeft.mins },
            { label: "Secs", val: timeLeft.secs },
          ].map((item, i) => (
            <div key={i} className="group flex flex-col items-center">
              <div className="w-full aspect-square bg-white/[0.03] border border-white/[0.08] rounded-xl md:rounded-2xl flex items-center justify-center backdrop-blur-md transition-all group-hover:border-purple-500/50 group-hover:bg-white/[0.06]">
                <span className="text-xl md:text-4xl font-black font-mono bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                  {item.val < 10 ? `0${item.val}` : item.val}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-widest mt-3 text-gray-500 font-bold group-hover:text-purple-400 transition-colors">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Improved Call to Action */}
        <div className="w-full max-w-sm md:max-w-md relative group px-4 md:px-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-md opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative flex flex-col md:flex-row gap-2 p-1.5 bg-[#0a0b14] border border-white/10 rounded-2xl overflow-hidden focus-within:border-purple-500/50 transition-all">
            <button
              onClick={actions.addMiniApp}
              disabled={added}
              className="bg-white text-black hover:bg-purple-500 hover:text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
            >
              <Bell size={18} />
              Get Access
            </button>
          </div>
        </div>
      </div>

      {/* Noise Overaly for Texture */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dztwwt9as/image/upload/v1646768827/noise_fuv0is.png')] opacity-[0.03] pointer-events-none"></div>

      {/* Custom Styles for Animation */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
