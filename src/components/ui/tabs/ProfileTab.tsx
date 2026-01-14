"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Award,
  ExternalLink,
  Wallet,
  Copy,
  Check,
  Settings,
  LogOut,
  Share2,
  TrendingUp,
  Zap,
  Hexagon,
  ArrowUpRight,
} from "lucide-react";
import { useMiniApp } from "@neynar/react";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import AdminRoute from "~/app/admin/admin";

export const ProfileTab = () => {
  const { context } = useMiniApp();
  const { address } = useAccount();
  const { data: balanceData } = useBalance({
    address: address,
    token: "0x402B7796bd6d27b61677A325185453ca60DfE2A8",
  });

  const [copied, setCopied] = useState(false);

  const name = context?.user?.displayName ?? "Guest User";
  const username = context?.user?.username;
  const fid = context?.user?.fid;
  const profilePic = context?.user?.pfpUrl;

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formattedBalance = balanceData
    ? parseFloat(formatEther(balanceData.value)).toFixed(0)
    : "0";

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 font-sans selection:bg-blue-500/30">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-lg mx-auto pt-8 space-y-6">
        {/* PROFILE HEADER SECTION */}
        <section className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            {/* Multi-layered Avatar Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500" />

            <div className="relative w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr from-blue-500 via-transparent to-purple-500">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-black bg-neutral-900">
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt={name}
                    className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                    <Hexagon className="text-neutral-600" />
                  </div>
                )}
              </div>

              {/* Verified Badge */}
              <motion.div
                whileHover={{ rotate: 360 }}
                className="absolute -bottom-1 -right-1 bg-blue-500 p-2 rounded-xl border-[3px] border-[#050505] shadow-lg shadow-blue-500/20"
              >
                <ShieldCheck size={16} className="text-white fill-white/20" />
              </motion.div>
            </div>
          </motion.div>

          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent">
              {name}
            </h1>
            <p className="text-neutral-500 font-medium text-sm mt-1">
              @{username || "anonymous"}
            </p>
          </div>
        </section>

        {/* BENTO STATS GRID */}
        <div className="grid grid-cols-2 gap-3">
          {/* Main Balance Card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="col-span-2 bg-gradient-to-br from-white/10 to-white/[0.02] border border-white/10 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={80} />
            </div>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">
              Total Balance
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-black">{formattedBalance}</h2>
              <span className="text-lg font-bold text-neutral-400">FR</span>
            </div>
          </motion.div>

          {/* Level Card */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2">
            <Award className="text-yellow-500" size={20} />
            <div className="text-center">
              <p className="text-[10px] text-neutral-500 uppercase font-bold">
                Status
              </p>
              <p className="text-sm font-bold">Member</p>
            </div>
          </div>

          <AdminRoute />

          {/* Daily Streak Card */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2 group hover:border-orange-500/30 transition-all">
            <Zap
              className="text-orange-500 fill-orange-500/20 group-hover:animate-bounce"
              size={20}
            />
            <div className="text-center">
              <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-tight">
                Streak
              </p>
              <div className="flex items-center gap-1 justify-center">
                <p className="text-sm font-bold text-white">0 Days</p>
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* WALLET & IDENTITY */}
        <div className="bg-neutral-900/50 rounded-3xl p-2 border border-white/5 space-y-1">
          <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Hexagon size={18} />
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 uppercase font-bold">
                  Farcaster ID
                </p>
                <p className="text-sm font-mono font-bold text-neutral-200">
                  {fid || "---"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.06] transition-colors rounded-2xl group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Wallet size={18} />
              </div>
              <div className="text-left">
                <p className="text-[10px] text-neutral-500 uppercase font-bold">
                  Wallet Address
                </p>
                <p className="text-sm font-mono font-bold text-neutral-200">
                  {address ? truncateAddress(address) : "Connect Wallet"}
                </p>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  key="check"
                >
                  <Check size={18} className="text-green-500" />
                </motion.div>
              ) : (
                <Copy
                  size={18}
                  className="text-neutral-600 group-hover:text-white"
                />
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* SETTINGS MENU */}
        <div className="space-y-2">
          {[
            {
              label: "Account Settings",
              icon: Settings,
              color: "text-neutral-400",
            },
            { label: "Share Profile", icon: Share2, color: "text-neutral-400" },
            { label: "Disconnect", icon: LogOut, color: "text-red-400" },
          ].map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-4">
                <item.icon size={20} className={item.color} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              <ExternalLink
                size={14}
                className="opacity-0 group-hover:opacity-40 transition-opacity"
              />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
