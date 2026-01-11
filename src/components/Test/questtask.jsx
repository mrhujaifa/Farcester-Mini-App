import React, { useState } from "react";
import {
  Trophy,
  Flame,
  Coins,
  Zap,
  Star,
  ShieldCheck,
  ChevronRight,
  Gift,
} from "lucide-react";
import { useMiniApp } from "@neynar/react";

const AdvanceQuestSystem = () => {
  const [activeTab, setActiveTab] = useState("daily");

  const quests = [
    {
      id: 1,
      title: "Night Owl",
      desc: "Win a match after 10 PM",
      reward: "150 XP",
      progress: 1,
      total: 1,
      status: "claimable",
      rarity: "epic",
      icon: <Zap />,
    },
    {
      id: 2,
      title: "Sharp Shooter",
      desc: "Get 10 Headshots",
      reward: "300 XP",
      progress: 4,
      total: 10,
      status: "in-progress",
      rarity: "rare",
      icon: <ShieldCheck />,
    },
    {
      id: 3,
      title: "Social Bee",
      desc: "Share your stats",
      reward: "50 XP",
      progress: 0,
      total: 1,
      status: "locked",
      rarity: "common",
      icon: <Star />,
    },
  ];

  const { context } = useMiniApp();
  const name = context?.user.displayName;

  const rarityStyles = {
    common: "from-slate-500/20 to-slate-700/20 border-slate-600",
    rare: "from-blue-500/20 to-indigo-700/20 border-blue-500/50",
    epic: "from-purple-500/20 to-fuchsia-700/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
  };

  return (
    <div className=" text-white p-5 font-sans selection:bg-purple-500">
      {/* --- Top Stats Panel --- */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center font-bold text-lg shadow-lg rotate-3">
              12
            </div>
            <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] px-1 rounded font-black italic uppercase">
              Pro
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-300">{name}</h2>
            <div className="flex items-center gap-1 text-orange-400">
              <Flame size={14} fill="currentColor" />
              <span className="text-xs font-bold">0 Day Streak</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight">0 $FR</span>
          </div>
        </div>
      </div>

      {/* --- XP Bar ---
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          <span>XP Progress</span>
          <span>850 / 1000</span>
        </div>
        <div className="h-3 w-full bg-slate-800 rounded-full p-0.5 border border-slate-700">
          <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full w-[85%] relative shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            <div className="absolute top-0 right-0 h-full w-2 bg-white/30 blur-sm"></div>
          </div>
        </div>
      </div> */}

      {/* --- Tab Switcher (Modern Capsule) --- */}
      <div className="bg-slate-800/40 p-1 rounded-2xl flex mb-8 border border-slate-700/50">
        {["daily", "weekly", "seasonal"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold uppercase rounded-xl transition-all ${
              activeTab === tab
                ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
                : "text-slate-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- Quests Section --- */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-black italic uppercase tracking-tight">
            Active Quests
          </h3>
          <span className="text-[10px] text-slate-500 font-bold uppercase">
            Resets in 4h 20m
          </span>
        </div>

        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`relative overflow-hidden p-[1px] rounded-3xl bg-gradient-to-b ${
              quest.status === "claimable"
                ? "from-blue-400 to-purple-600"
                : "from-slate-700 to-slate-800"
            }`}
          >
            <div
              className={`bg-[#161b29] p-4 rounded-[23px] flex items-center justify-between gap-4 bg-gradient-to-br ${
                rarityStyles[quest.rarity]
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                    quest.rarity === "epic"
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {quest.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">{quest.title}</h4>
                    <span
                      className={`text-[8px] uppercase px-1.5 py-0.5 rounded border ${
                        quest.rarity === "epic"
                          ? "border-purple-500 text-purple-400"
                          : "border-slate-600 text-slate-500"
                      }`}
                    >
                      {quest.rarity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                    {quest.desc}
                  </p>

                  {/* Progress Mini Bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1 bg-black/40 rounded-full">
                      <div
                        className={`h-full rounded-full ${
                          quest.status === "claimable"
                            ? "bg-green-400"
                            : "bg-blue-500"
                        }`}
                        style={{
                          width: `${(quest.progress / quest.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {quest.progress}/{quest.total}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg">
                  <Gift size={12} className="text-pink-500" />
                  <span className="text-[10px] font-bold tracking-tighter">
                    {quest.reward}
                  </span>
                </div>
                <button
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg ${
                    quest.status === "claimable"
                      ? "bg-white text-black scale-105 active:scale-95"
                      : "bg-slate-800 text-slate-600"
                  }`}
                >
                  {quest.status === "claimable" ? "Claim" : "Go"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdvanceQuestSystem;
