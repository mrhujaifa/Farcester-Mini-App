"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  RefreshCw,
  ShieldCheck,
  Award,
  ChevronRight,
  ExternalLink,
  Wallet,
  Copy,
} from "lucide-react";
import { useMiniApp } from "@neynar/react";
import { useAccount } from "wagmi";

export const ProfileTab = () => {
  const { context } = useMiniApp();
  const { address } = useAccount();

  const name = context?.user?.displayName ?? "Guest User";
  const username = context?.user?.username;
  const fid = context?.user?.fid;
  const profilePic = context?.user?.pfpUrl;

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="min-h-screen bg-[#03050a] text-white p-4 md:p-8 font-sans pb-24">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {/* PROFILE HEADER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-2xl p-6 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center">
            {/* Profile Image with Glow */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#03050a]">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800" />
                  )}
                </div>
                <div className="absolute bottom-1 right-1 bg-blue-500 p-2 rounded-full border-4 border-[#03050a] shadow-xl">
                  <ShieldCheck size={16} className="text-white" />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {name}
              </h2>
              {username && (
                <div className="inline-block px-3 py-1 mt-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                  @{username}
                </div>
              )}
            </div>

            {/* Quick Stats/IDs */}
            <div className="grid grid-cols-2 gap-3 w-full mt-8">
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-wider text-gray-500">
                  Farcaster ID
                </span>
                <span className="text-sm font-mono font-bold">
                  {fid ?? "N/A"}
                </span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-start group cursor-pointer">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 flex items-center gap-1">
                  Wallet <Copy size={10} />
                </span>
                <span className="text-sm font-mono font-bold truncate w-full text-left">
                  {address ? truncateAddress(address) : "Not Linked"}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* REWARDS & ACTIONS SECTION */}
        <div className="grid grid-cols-1 gap-4">
          {/* Rewards Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0a0c14] border border-emerald-500/20 rounded-[2rem] p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award size={80} className="text-emerald-500" />
            </div>

            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Total Rewards</h3>
                  <p className="text-xs text-emerald-500/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Live on-chain
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ rotate: 180 }}
                className="p-2.5 bg-white/5 rounded-xl border border-white/10"
              >
                <RefreshCw size={20} className="text-gray-400" />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div className="text-4xl md:text-5xl font-black tracking-tighter">
                0.00{" "}
                <span className="text-xl md:text-2xl text-gray-600 font-medium">
                  ETH
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                Claim Rewards <ExternalLink size={18} />
              </motion.button>
            </div>
          </motion.div>

          {/* Quick Menu Links */}
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: "Quest History", icon: Award, color: "text-purple-400" },
              {
                label: "Security Settings",
                icon: ShieldCheck,
                color: "text-blue-400",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={item.color} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-600" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
