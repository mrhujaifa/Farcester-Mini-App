import React from "react";
import { motion } from "framer-motion";
import { Home, UserRound, Scroll, Award, RefreshCw } from "lucide-react";
import { GiDiamondHard } from "react-icons/gi";

import { Tab } from "~/components/App";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  showWallet: boolean;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: Tab.Home, label: "Home", icon: Home },
    { id: Tab.Quests, label: "Quests", icon: Scroll },
    { id: Tab.Mint, label: "Mint", icon: GiDiamondHard },
    { id: Tab.Swap, label: "Swap", icon: RefreshCw },
    { id: Tab.Rank, label: "Ranks", icon: Award },
    { id: Tab.Profile, label: "Profile", icon: UserRound },
    // { id: Tab.Profile, label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 px-3 pb-4 z-50">
      <div className="max-w-md mx-auto bg-[#0b0a11] border border-white/10 rounded-[15px] p-2 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-2 transition-all"
            >
              {/* Active lighting system */}
              {isActive && (
                <>
                  {/* Glowing Box Overlay */}
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 rounded-[22px] border border-[#17a0e5]/40 bg-[#17a0e5]/5 active-lighting-box"
                    transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  />

                  {/* Bottom Ray (Small light flare at the bottom) */}
                  <motion.div
                    layoutId="bottom-ray"
                    className="absolute -bottom-1 w-1/2 h-[2px] bottom-ray z-0"
                  />
                </>
              )}

              <div className="relative z-10 flex flex-col items-center gap-1.5">
                <Icon
                  size={22}
                  className={`transition-all duration-300 ${
                    isActive ? "text-[#17a0e5] icon-neon" : "text-gray-500"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                    isActive
                      ? "text-[#17a0e5] opacity-100"
                      : "text-gray-500 opacity-60"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
