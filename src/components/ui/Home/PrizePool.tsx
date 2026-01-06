"use client";

import React, { useCallback } from "react";
import {
  Users,
  Trophy,
  Coins,
  CheckCircle2,
  Info,
  Zap,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useContractRead,
} from "wagmi";

export default function PrizeCardUI() {
  const contractAddress = "0x6f9FBA04733ff91De596dC5fb64034ee9c2eF7f2";

  const abi = [
    {
      name: "enterRaffle",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [],
      outputs: [],
    },
    {
      name: "getEntryCount",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
    {
      name: "getMaxEntries",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
    {
      name: "getPrizeAmount",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
    {
      name: "getPrizeUSDValue",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
  ] as const;

  // ট্রানজেকশন পাঠানোর হুক
  const {
    data: hash,
    error,
    writeContract,
    isPending: isSubmitting,
  } = useWriteContract();

  // ট্রানজেকশন কনফার্মেশন চেক করার হুক
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // স্মার্ট কন্ট্রাক্ট থেকে ডাটা ফেচ
  const { data: entriesData } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "getEntryCount",
  });

  const { data: maxEntriesData } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "getMaxEntries",
  });

  const { data: prizeAmountData } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "getPrizeAmount",
  });

  const { data: prizeUSDValueData } = useContractRead({
    address: contractAddress,
    abi: abi,
    functionName: "getPrizeUSDValue",
  });

  // ডাটা প্রসেসিং
  const entries = entriesData ? Number(entriesData) : 0;
  const maxEntries = maxEntriesData ? Number(maxEntriesData) : 100;
  const prizeAmount = prizeAmountData ? Number(prizeAmountData) : 20000;
  const prizeUSDValue = prizeUSDValueData
    ? Number(prizeUSDValueData) / 100
    : 20;

  const handleWinNow = useCallback(() => {
    if (isConfirmed) return;

    writeContract({
      address: contractAddress as `0x${string}`,
      abi: abi,
      functionName: "enterRaffle",
    });
  }, [isConfirmed, writeContract]);

  return (
    <div className="flex items-center justify-center px-3 bg-[#020408]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full p-5 space-y-6 bg-[#05080f]/80 backdrop-blur-xl rounded-[15px] border border-white/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full"></div>

        <div className="flex justify-between items-center relative z-10">
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-1.5">
            <Zap size={12} className="text-blue-400 fill-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
              High Yield Raffle
            </span>
          </div>
          <div className="flex -space-x-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full border-2 border-[#05080f] bg-gradient-to-tr from-gray-700 to-gray-900"
              />
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-[#05080f] bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
              +48
            </div>
          </div>
        </div>

        {/* Entries */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                <Users size={14} />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Entries
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">{entries}</span>
              <span className="text-xs text-gray-600 font-bold">
                / {maxEntries}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(entries / maxEntries) * 100}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
              />
            </div>
          </motion.div>

          {/* Prize */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 relative overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                <Coins size={14} />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Prize
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">
                {prizeAmount.toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-amber-500 tracking-widest leading-none mt-1">
                $FR TOKEN
              </span>
              <span className="text-[10px] text-gray-500 mt-1">
                ≈ ${prizeUSDValue.toFixed(2)} USDC
              </span>
            </div>
          </motion.div>
        </div>

        {/* Distribution */}
        <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-4 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-blue-400" />
              <h4 className="text-xs font-bold text-white tracking-wide">
                Distribution
              </h4>
            </div>
            <ShieldCheck size={14} className="text-emerald-500/50" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-[#05080f]/50 border border-white/5 rounded-xl">
              <div>
                <p className="text-[9px] text-blue-400 font-black uppercase">
                  Top 10 Winners
                </p>
                <p className="text-sm font-bold text-white">
                  2,000 $FR{" "}
                  <span className="text-gray-500 font-medium text-[10px]">
                    each
                  </span>
                </p>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div className="text-right">
                <p className="text-[9px] text-gray-500 font-black uppercase">
                  Odds
                </p>
                <p className="text-sm font-bold text-emerald-400">10%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Win Now Button */}
        <div className="space-y-4">
          <motion.button
            onClick={handleWinNow}
            disabled={isSubmitting || isConfirming || isConfirmed}
            whileTap={{ scale: 0.95 }}
            className={`group relative w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all duration-500 overflow-hidden ${
              isConfirmed
                ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]"
            } disabled:opacity-80 disabled:cursor-not-allowed`}
          >
            <AnimatePresence mode="wait">
              {isSubmitting || isConfirming ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center gap-2"
                >
                  <Loader2 size={18} className="animate-spin" />{" "}
                  {isSubmitting ? "SIGNING..." : "CONFIRMING..."}
                </motion.span>
              ) : isConfirmed ? (
                <motion.span
                  key="joined"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> YOU ARE IN
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  exit={{ y: -20 }}
                  className="relative z-10 flex items-center justify-center gap-2"
                >
                  WIN NOW
                </motion.span>
              )}
            </AnimatePresence>
            {!isConfirmed && !isSubmitting && !isConfirming && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
            )}
          </motion.button>

          {error && (
            <p className="text-red-500 text-[10px] text-center mt-2 bg-red-500/5 py-1 rounded-lg border border-red-500/10">
              {error.message.includes("User rejected")
                ? "Transaction rejected"
                : "Transaction failed"}
            </p>
          )}

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                02d : 14h : 30m
              </div>
              <div className="w-1 h-1 bg-white/10 rounded-full" />
              <button className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1">
                <Info size={10} /> View Rules
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-16 h-16 bg-blue-500/10 [clip-path:polygon(0%_0%,100%_0%,0%_100%)]"></div>
      </motion.div>
    </div>
  );
}
