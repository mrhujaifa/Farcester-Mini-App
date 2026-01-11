import React, { useState } from "react";
import { ChevronDown, Search, X, Check, Info, Lock } from "lucide-react"; // Lock icon add kora hoyeche
import Image from "next/image";
import { useMiniApp } from "@neynar/react";

export const SwapTab = () => {
  const [open, setOpen] = useState(false);
  const [activeSide, setActiveSide] = useState<"sell" | "buy">("sell");

  const [sellToken, setSellToken] = useState({
    name: "Base Ethereum",
    symbol: "ETH",
    icon: "/base.png",
    color: "bg-blue-600",
  });

  const [buyToken, setBuyToken] = useState({
    name: "Select token",
    symbol: "",
    icon: "",
    color: "bg-gray-700",
  });

  const tokenList = [
    {
      name: "Base Ethereum",
      symbol: "ETH",
      icon: "/base.png",
      color: "bg-blue-600",
    },
    {
      name: "FarRewards",
      symbol: "FR",
      icon: "/icon.png",
      color: "bg-purple-600",
    },
  ];

  const handleOpenModal = (side: "sell" | "buy") => {
    setActiveSide(side);
    setOpen(true);
  };

  const selectToken = (token: any) => {
    if (activeSide === "sell") setSellToken(token);
    else setBuyToken(token);
    setOpen(false);
  };

  const { actions, added } = useMiniApp();

  return (
    <div className="relative flex items-center justify-center p-4 bg-[#010409] overflow-hidden ">
      {/* Background Neon Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#FF007A]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />

      {/* Main Card */}
      <div className="w-full max-w-[480px] bg-[#0d1117]/80 backdrop-blur-xl rounded-[32px] p-2 shadow-2xl border border-gray-800/50 relative z-10 overflow-hidden">
        {/* --- COMING SOON OVERLAY --- */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0d1117]/60 backdrop-blur-[6px] transition-all">
          <div className="bg-[#161b22]/90 border border-gray-700/50 p-6 rounded-[28px] shadow-2xl flex flex-col items-center text-center scale-110">
            <div className="w-16 h-16 bg-[#FF007A]/10 rounded-full flex items-center justify-center mb-4 border border-[#FF007A]/20">
              <Lock className="text-[#FF007A]" size={28} />
            </div>
            <h3 className="text-white text-2xl font-bold tracking-tight">
              Coming Soon
            </h3>
            <p className="text-gray-400 text-sm mt-2 max-w-[200px]">
              Our decentralized swap engine is under development. Tomorrow Swap
              system Coming soon! <br />
              $FR to $BaseETH
            </p>
            <button
              disabled={added}
              onClick={actions.addMiniApp}
              className="mt-6 px-6 cursor-pointer py-2 bg-[#FF007A] text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg shadow-[#FF007A]/20"
            >
              Stay Tuned
            </button>
          </div>
        </div>

        {/* Content (Blurred via Overlay) */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-white font-semibold text-lg opacity-90 tracking-tight">
            Swap
          </span>
          <button className="p-2 hover:bg-gray-800 rounded-xl transition-all text-gray-400">
            <Info size={20} />
          </button>
        </div>

        <div className="relative mt-1 space-y-1">
          {/* Sell Section */}
          <div className="bg-[#161b22] rounded-[24px] p-5 border border-transparent">
            <span className="text-gray-400 text-sm font-medium">You sell</span>
            <div className="flex justify-between items-center gap-4 mt-2">
              <input
                type="text"
                placeholder="0"
                disabled
                className="bg-transparent text-4xl outline-none w-full font-medium text-white"
              />
              <button className="flex items-center gap-2 bg-[#21262d] border border-gray-700 rounded-full py-1.5 pl-1.5 pr-3 text-white">
                <div
                  className={`w-7 h-7 ${sellToken.color} rounded-full overflow-hidden flex items-center justify-center`}
                >
                  <Image
                    src={sellToken.icon}
                    alt="token"
                    width={28}
                    height={28}
                  />
                </div>
                <span className="font-bold text-lg">{sellToken.symbol}</span>
                <ChevronDown size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Buy Section */}
          <div className="bg-[#161b22] rounded-[24px] p-5 pt-7 border border-transparent">
            <span className="text-gray-400 text-sm font-medium">You buy</span>
            <div className="flex justify-between items-center mt-2 gap-4">
              <input
                type="text"
                placeholder="0"
                disabled
                className="bg-transparent text-4xl outline-none w-full font-medium text-white"
              />
              <button className="bg-[#FF007A] py-2 px-4 text-white rounded-full flex items-center gap-2 font-bold uppercase text-sm">
                Select token
                <ChevronDown size={20} />
              </button>
            </div>
          </div>
        </div>

        <button
          disabled
          className="w-full mt-2 bg-[#21262d] text-gray-500 font-bold py-4 rounded-[24px] border border-gray-800 text-lg"
        >
          Exchange
        </button>
      </div>

      {/* Token Modal logic remains same but won't be reachable while overlay is active */}
    </div>
  );
};
