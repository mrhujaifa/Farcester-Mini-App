"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Users,
  Trophy,
  Coins,
  CheckCircle2,
  Info,
  Zap,
  ShieldCheck,
  Loader2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import toast from "react-hot-toast";
import Image from "next/image";
import Skeleton from "@mui/material/Skeleton";
import userImg from "../../../../public/user.png";

const MAX_ENTRIES = 100;
const EVENT_DURATION_MS =
  2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 30 * 60 * 1000;

/**
 * কাস্টম স্কেলিটন কম্পোনেন্ট - যা আপনার অরিজিনাল UI এর লেআউটকে হুবহু নকল করে
 */
const RaffleSkeleton = () => (
  <div className="max-w-sm w-full p-5 space-y-6 bg-[#05080f]/80 backdrop-blur-xl rounded-[15px] border border-white/10 relative overflow-hidden mx-auto">
    {/* Header Skeleton */}
    <div className="flex justify-between items-center">
      <Skeleton
        variant="rounded"
        width={110}
        height={24}
        sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: "999px" }}
      />
      <div className="flex -space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            variant="circular"
            width={24}
            height={24}
            sx={{
              bgcolor: "rgba(255,255,255,0.08)",
              border: "2px solid #05080f",
            }}
          />
        ))}
      </div>
    </div>

    {/* Grid Skeleton */}
    <div className="grid grid-cols-2 gap-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <Skeleton
              variant="circular"
              width={20}
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
            />
            <Skeleton
              variant="text"
              width={50}
              sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
            />
          </div>
          <Skeleton
            variant="text"
            width="80%"
            height={35}
            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
          />
          <Skeleton
            variant="rounded"
            width="100%"
            height={6}
            sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
          />
        </div>
      ))}
    </div>

    {/* Distribution Skeleton */}
    <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 space-y-4">
      <div className="flex justify-between">
        <Skeleton
          variant="text"
          width={100}
          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
        />
        <Skeleton
          variant="circular"
          width={16}
          height={16}
          sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
        />
      </div>
      <div className="p-3 bg-white/[0.02] rounded-xl flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton
            variant="text"
            width={60}
            sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
          />
          <Skeleton
            variant="text"
            width={90}
            sx={{ bgcolor: "rgba(255,255,255,0.1)" }}
          />
        </div>
        <Skeleton
          variant="rounded"
          width={40}
          height={30}
          sx={{ bgcolor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
        />
      </div>
    </div>

    {/* Button Skeleton */}
    <Skeleton
      variant="rounded"
      width="100%"
      height={54}
      sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: "16px" }}
    />
  </div>
);

export default function PrizeCardUI() {
  const { address } = useAccount();

  const [entriesCount, setEntriesCount] = useState(0);
  const [hasUserEntered, setHasUserEntered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EVENT_DURATION_MS);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [Alldata, setAllData] = useState<{
    totalCount: number | undefined;
    entries: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  const raffleRules = [
    "Each wallet can enter only once.",
    "Maximum 100 entries allowed in total.",
    "Winners will be selected randomly after event ends.",
    "Prize is 20,000 $FR",
    "Top 10 winners share the prize equally.",
    "The price of Future $FR is tied to the market value of Ethereum (ETH).",
    "More $FR more rewards",
  ];

  const {
    data: hash,
    error,
    writeContract,
    isPending: isSubmitting,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  const contractAddress = "0x6f9FBA04733ff91De596dC5fb64034ee9c2eF7f2";

  const abi = [
    {
      name: "enterRaffle",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [],
      outputs: [],
    },
  ] as const;

  const loadRaffleState = useCallback(async () => {
    if (!address) return;
    try {
      const res = await fetch(`/api/raffle/state?address=${address}`);
      if (!res.ok) throw new Error("Failed to load raffle state");
      const data = await res.json();
      setEntriesCount(data.entriesCount);
      setHasUserEntered(data.hasUserEntered);
    } catch {
      // Ignore
    }
  }, [address]);

  useEffect(() => {
    loadRaffleState();
  }, [loadRaffleState]);

  interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }

  function useCountdown(initialSeconds: number): TimeLeft {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

    useEffect(() => {
      let remaining = initialSeconds;

      const calculateTimeLeft = (secs: number): TimeLeft => {
        const days = Math.floor(secs / (24 * 3600));
        secs %= 24 * 3600;
        const hours = Math.floor(secs / 3600);
        secs %= 3600;
        const minutes = Math.floor(secs / 60);
        const seconds = secs % 60;
        return { days, hours, minutes, seconds };
      };

      setTimeLeft(calculateTimeLeft(remaining));

      const interval = setInterval(() => {
        remaining = remaining > 0 ? remaining - 1 : 0;
        setTimeLeft(calculateTimeLeft(remaining));

        if (remaining === 0) clearInterval(interval);
      }, 1000);

      return () => clearInterval(interval);
    }, [initialSeconds]);

    return timeLeft;
  }

  const { days, hours, minutes, seconds } = useCountdown(300000);

  useEffect(() => {
    if (!isConfirmed || !hash || !address || hasUserEntered) return;
    const postEntry = async () => {
      try {
        const res = await fetch("/api/raffle/enter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, txHash: hash }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Entry failed");
          setSuccessMsg("");
          return;
        }
        await loadRaffleState();
        setSuccessMsg(
          "Congratulations! You have successfully joined the event."
        );
        setErrorMsg("");
      } catch {
        setErrorMsg("Network or server error");
        setSuccessMsg("");
      }
    };
    postEntry();
  }, [isConfirmed, hash, address, hasUserEntered, loadRaffleState]);

  useEffect(() => {
    if (!error) return;
    if (error.message.includes("User rejected")) {
      setErrorMsg("Transaction rejected by user");
    } else {
      setErrorMsg("Transaction failed");
    }
  }, [error]);

  const handleWinNow = useCallback(() => {
    if (
      !address ||
      hasUserEntered ||
      entriesCount >= MAX_ENTRIES ||
      isSubmitting ||
      isConfirming
    )
      return;
    setErrorMsg("");
    setSuccessMsg("");
    writeContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName: "enterRaffle",
    });
  }, [
    address,
    hasUserEntered,
    entriesCount,
    isSubmitting,
    isConfirming,
    writeContract,
  ]);

  useEffect(() => {
    fetch("/api/raffle/enter")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch raffle entries");
        return res.json();
      })
      .then((alldata) => {
        setAllData(alldata);
        setLoading(false);
      })
      .catch((err: Error) => {
        setLoading(false);
        toast.error(err.message || "Something went wrong");
      });
  }, []);

  // --- সুন্দর ভাবে ম্যানেজ করা লোডিং স্টেট ---
  if (loading) {
    return (
      <div className="flex items-center justify-center px-3 py-10 min-h-[500px]">
        <RaffleSkeleton />
      </div>
    );
  }

  const progressPercentage = Alldata?.totalCount
    ? (Alldata.totalCount / MAX_ENTRIES) * 100
    : 0;

  return (
    <div className="flex items-center justify-center px-3 ">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full p-5 space-y-6 bg-[#05080f]/80 backdrop-blur-xl rounded-[15px] border border-white/10 shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] relative overflow-hidden"
      >
        {/* Background Blur Circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-[60px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 blur-[60px] rounded-full"></div>

        {/* Header */}
        <div className="flex justify-between items-center relative z-10">
          <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-1.5">
            <Zap size={12} className="text-blue-400 fill-blue-400" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">
              High Yield Raffle
            </span>
          </div>
          <div className="flex -space-x-2 items-center">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full overflow-hidden border-2 border-[#05080f] bg-gray-800"
              >
                <Image
                  src={userImg}
                  height={24}
                  width={24}
                  alt="user img"
                  className="object-cover"
                />
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-[#05080f] bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
              +{Alldata?.totalCount ?? 0}
            </div>
          </div>
        </div>

        {/* Info & Prize Cards */}
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
              <span className="text-2xl font-black text-white">
                {Alldata?.totalCount}
              </span>
              <span className="text-xs text-gray-600 font-bold">
                / {MAX_ENTRIES}
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(Math.max(progressPercentage, 0), 100)}%`,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.6)] rounded-full"
              />
            </div>
          </motion.div>

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
              <span className="text-2xl font-black text-white">20,000</span>
              <span className="text-[9px] font-bold text-amber-500 tracking-widest leading-none mt-1">
                $FR TOKEN
              </span>
              <span className="text-[10px] text-gray-500 mt-1">
                ≈ $20.00 USDC
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

        {/* Error & Success Messages */}
        {errorMsg && (
          <p className="text-red-500 text-[10px] text-center mt-2 bg-red-500/10 py-1 rounded-lg border border-red-500/20">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="text-green-600 text-[10px] text-center mt-2 bg-green-500/10 py-1 rounded-lg border border-green-500/20">
            {successMsg}
          </p>
        )}

        <div className="space-y-4">
          <motion.button
            onClick={handleWinNow}
            disabled={
              isSubmitting ||
              isConfirming ||
              entriesCount >= MAX_ENTRIES ||
              hasUserEntered
            }
            whileTap={{ scale: 0.95 }}
            className={`group relative w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all duration-500 overflow-hidden ${
              hasUserEntered || entriesCount >= MAX_ENTRIES
                ? "bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 cursor-not-allowed"
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
              ) : hasUserEntered ? (
                <motion.span
                  key="joined"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} /> YOU ARE IN
                </motion.span>
              ) : entriesCount >= MAX_ENTRIES ? (
                <motion.span
                  key="ended"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="flex items-center justify-center gap-2"
                >
                  🚫 EVENT ENDED
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

            {!hasUserEntered &&
              !isSubmitting &&
              !isConfirming &&
              entriesCount < MAX_ENTRIES && (
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

          {/* Time Left + View Rules Button */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-tighter">
              <div className="flex items-center gap-1 text-[#ed2323]">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                {days} DAY : {hours} HOURS : {minutes} MIN
              </div>
              <div className="w-1 h-1 bg-white/10 rounded-full" />

              {/* View Rules Button */}
              <button
                onClick={() => setShowRules(true)}
                className="text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Info size={10} /> View Rules
              </button>
            </div>
          </div>

          {/* Rules Popup */}
          <AnimatePresence>
            {showRules && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-[#05080f]/95 border border-white/20 rounded-lg max-w-sm w-full p-6 relative shadow-lg"
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowRules(false)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close Rules Popup"
                  >
                    <X size={20} />
                  </button>

                  {/* Title */}
                  <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <Info size={20} className="text-blue-400" /> Raffle Rules
                  </h2>

                  {/* Rules List */}
                  <ul className="text-gray-300 text-sm space-y-2 max-h-60 overflow-y-auto list-disc list-inside">
                    {raffleRules.map((rule, i) => (
                      <li key={i}>{rule}</li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute top-0 left-0 w-16 h-16 bg-blue-500/10 [clip-path:polygon(0%_0%,100%_0%,0%_100%)]"></div>
      </motion.div>
    </div>
  );
}
