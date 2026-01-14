"use client";

import React, { useEffect, useState } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Coins, X } from "lucide-react";
import confetti from "canvas-confetti";
import { parseUnits } from "viem";
import toast, { Toaster } from "react-hot-toast";

import { REWAED_CLAIM_ABI } from "../../../../abi";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useMiniApp } from "@neynar/react";

// --- Types ---
interface Reward {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const REWARDS: Reward[] = [
  { label: "25 $FR", value: 25, color: "#00f2ff", icon: <Coins size={20} /> },
  { label: "10 $FR", value: 10, color: "#818cf8", icon: <Coins size={20} /> },
  { label: "40 $FR", value: 40, color: "#fbbf24", icon: <Coins size={20} /> },
  { label: "50 $FR", value: 50, color: "#f472b6", icon: <Coins size={20} /> },
  { label: "100 $FR", value: 100, color: "#34d399", icon: <Coins size={20} /> },
  { label: "70 $FR", value: 70, color: "#94a3b8", icon: <Coins size={20} /> },
];

const SpinSystem: React.FC = () => {
  const [balance, setBalance] = useState<number>(750);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [reward, setReward] = useState<Reward | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [dailySpins, setDailySpins] = useState(0);
  const [totalSpins, setTotalSpins] = useState(0);
  const [canSpin, setCanSpin] = useState(true);

  const controls = useAnimation();
  const { isConnected, address: userAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { actions } = useMiniApp();

  const MAX_DAILY_SPINS = 5;

  // Load saved data on component mount
  useEffect(() => {
    const savedData = JSON.parse(
      localStorage.getItem("animalSpinData") || "{}"
    );
    const today = new Date().toDateString();

    if (savedData.date === today) {
      const spinsToday = savedData.dailySpins || 0;
      setDailySpins(spinsToday);
      setCanSpin(spinsToday < MAX_DAILY_SPINS);
    } else {
      setDailySpins(0);
      setCanSpin(true);
    }

    setTotalSpins(savedData.totalSpins || 0);
  }, []);

  const claimContactAdress = "0xb94F9c81176663f8486FF6df2FdD9391d779d3aB";
  const claimABI = REWAED_CLAIM_ABI;

  const handleSpin = async (): Promise<void> => {
    // Check constraints
    if (!isConnected) {
      toast.error("Please connect your wallet first!");
      return;
    }
    if (dailySpins >= MAX_DAILY_SPINS) {
      toast.error("Daily spin limit reached (5/5). Come back tomorrow!");
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setReward(null);
    setShowPopup(false);

    const winningIndex = Math.floor(Math.random() * REWARDS.length);
    const sliceAngle = 360 / REWARDS.length;

    const totalRotation =
      360 * 10 + (360 - (winningIndex * sliceAngle + sliceAngle / 2));

    await controls.start({
      rotate: totalRotation,
      transition: { duration: 6, ease: [0.15, 0, 0, 1] },
    });

    const win = REWARDS[winningIndex];

    // Update State and Local Storage
    const newDailySpins = dailySpins + 1;
    const newTotalSpins = totalSpins + 1;
    const today = new Date().toDateString();

    setDailySpins(newDailySpins);
    setTotalSpins(newTotalSpins);
    setCanSpin(newDailySpins < MAX_DAILY_SPINS);

    localStorage.setItem(
      "animalSpinData",
      JSON.stringify({
        date: today,
        dailySpins: newDailySpins,
        totalSpins: newTotalSpins,
      })
    );

    setReward(win);
    setIsSpinning(false);
    setShowPopup(true);

    if (win.value > 0) {
      setBalance((prev) => prev + win.value);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [win.color, "#ffffff", "#00f2ff"],
      });
    }
  };

  const handleClaim = async () => {
    if (!reward || reward.value <= 0) return;
    if (!isConnected || !userAddress) {
      toast.error("Please connect your wallet first!");
      return;
    }

    const claimPromise = (async () => {
      setIsClaiming(true);

      const signResponse = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userAddress: userAddress,
          amount: reward.value,
        }),
      });

      const signData = await signResponse.json();
      if (!signData.isSuccess)
        throw new Error(signData.error || "Server signature failed");

      const { signature, nonce } = signData;
      const amountInWei = parseUnits(reward.value.toString(), 18);

      const hash = await writeContractAsync({
        address: claimContactAdress as `0x${string}`,
        abi: claimABI,
        functionName: "claimSpinWinPrize",
        args: [amountInWei, BigInt(nonce), signature as `0x${string}`],
      });

      setShowPopup(false);

      await actions.composeCast({
        text: `🎉 Woohoo! I just won ${reward?.label} from the spin system!\n
✨ Daily rewards, instant spins, exciting events,\n
🎨 NFT drops, and seamless swaps system await you!`,
        embeds: ["https://farcaster.xyz/miniapps/kaThIXNoQonz/farrewards"],
      });

      return hash;
    })();

    toast
      .promise(
        claimPromise,
        {
          loading: "Signing reward claim...",
          success: (hash) =>
            `Claim successful! TX: ${hash.toString().slice(0, 8)}...`,
          error: (err) => {
            setIsClaiming(false);
            if (err.message.includes("user rejected"))
              return "Transaction rejected by user.";
            return err.message || "Failed to claim.";
          },
        },
        {
          style: {
            background: "#0f172a",
            color: "#00f2ff",
            border: "1px solid rgba(0, 242, 255, 0.2)",
            textTransform: "uppercase",
            fontSize: "10px",
            fontWeight: "bold",
          },
        }
      )
      .finally(() => setIsClaiming(false));
  };

  return (
    <div className="  text-white flex flex-col items-center p-4 md:p-10 relative overflow-hidden font-sans">
      <Toaster position="top-right" />

      {/* Responsive SPIN LIMIT HEADER */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-[150] 
    w-[160px] sm:w-[200px] md:w-[230px]"
      >
        <div
          className="bg-black/40 backdrop-blur-md border border-white/10 
      rounded-full px-3 py-1.5 sm:px-4 sm:py-1.5 flex items-center justify-between 
      gap-2 sm:gap-3"
        >
          <div className="flex flex-col leading-tight">
            <span className="text-[6px] sm:text-[7px] text-cyan-400 font-black uppercase tracking-widest">
              Daily Spin
            </span>

            <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold">
              {isConnected
                ? `${MAX_DAILY_SPINS - dailySpins} Left`
                : "Not Connected"}
            </span>
          </div>

          <div
            className={`rounded-full shadow-[0_0_8px_currentColor] animate-pulse 
          h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5
          ${canSpin ? "bg-cyan-400" : "bg-red-500"}`}
          />
        </div>
      </div>

      {/* POPUP */}
      <AnimatePresence>
        {showPopup && reward && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 100 }}
              className="relative w-full max-w-sm p-8 rounded-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/20 backdrop-blur-2xl text-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white/50" />
              </button>

              <div className="mb-6 flex justify-center">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border-2"
                  style={{
                    borderColor: reward.color,
                    backgroundColor: `${reward.color}15`,
                    boxShadow: `0 0 30px ${reward.color}40`,
                  }}
                >
                  {React.cloneElement(reward.icon as React.ReactElement)}
                </div>
              </div>

              <p className="text-[10px] text-cyan-400 font-black tracking-[0.4em] uppercase mb-2">
                Extraction Success
              </p>
              <h2 className="text-4xl font-black italic tracking-tighter text-white mb-2 uppercase">
                {reward.label}
              </h2>
              <p className="text-white/50 text-xs mb-8">
                The resource has been synchronized with your neural link.
              </p>

              <button
                disabled={isClaiming || reward.value === 0}
                onClick={handleClaim}
                className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                  reward.value === 0
                    ? "bg-white/5 text-white/20 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                }`}
              >
                {isClaiming
                  ? "Processing..."
                  : reward.value === 0
                  ? "No Reward"
                  : "Claim $FR"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SPINNER WHEEL */}
      <div className="relative flex-1 top-10 flex flex-col items-center justify-center w-full">
        <div className="relative w-full max-w-[340px] md:max-w-[500px] aspect-square flex items-center justify-center">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
            <motion.div
              animate={isSpinning ? { y: [0, 8, 0] } : {}}
              className="w-1.5 h-12 bg-gradient-to-b from-cyan-400 to-transparent shadow-[0_0_15px_cyan]"
            />
            <div className="w-5 h-5 bg-cyan-400 rotate-45 -mt-3 shadow-[0_0_25px_#00f2ff]" />
          </div>

          <motion.div
            animate={controls}
            className="w-full h-full rounded-full relative overflow-hidden bg-[#030712] border-[12px] border-[#0f172a] shadow-[0_0_80px_rgba(0,0,0,0.9)]"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {REWARDS.map((_, i) => (
                <path
                  key={i}
                  d={`M 50 50 L ${
                    50 + 50 * Math.cos((Math.PI * i * 60) / 180)
                  } ${
                    50 + 50 * Math.sin((Math.PI * i * 60) / 180)
                  } A 50 50 0 0 1 ${
                    50 + 50 * Math.cos((Math.PI * (i + 1) * 60) / 180)
                  } ${50 + 50 * Math.sin((Math.PI * (i + 1) * 60) / 180)} Z`}
                  fill={
                    i % 2 === 0
                      ? "rgba(15, 23, 42, 0.6)"
                      : "rgba(2, 6, 23, 0.8)"
                  }
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.2"
                />
              ))}
            </svg>

            {REWARDS.map((item, i) => (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ transform: `rotate(${i * 60 + 30}deg)` }}
              >
                <div className="flex flex-col items-center gap-2 -translate-y-[110px] md:-translate-y-[160px]">
                  <div
                    className="p-2 md:p-3 rounded-xl bg-black/60 border border-white/10"
                    style={{
                      color: item.color,
                      boxShadow: `0 0 15px ${item.color}30`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="text-[10px] md:text-sm font-black tracking-tighter uppercase"
                    style={{ color: item.color }}
                  >
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="absolute w-24 h-24 md:w-36 md:h-36 rounded-full bg-[#050810] border-[6px] border-[#1e293b] flex items-center justify-center z-50 shadow-2xl">
            <div className="text-center">
              <p className="text-[8px] md:text-[10px] text-cyan-400/60 font-black tracking-[0.2em] uppercase">
                Status
              </p>
              <p className="text-sm md:text-xl font-black">
                {isSpinning ? "SCANNING" : "READY"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spin Button */}
      <div className="w-full max-w-sm z-50 mt-16">
        <motion.button
          onClick={handleSpin}
          whileHover={!canSpin || isSpinning ? {} : { scale: 1.02 }}
          whileTap={!canSpin || isSpinning ? {} : { scale: 0.98 }}
          disabled={isSpinning || !canSpin}
          className={`w-full relative py-6 rounded-2xl border transition-all duration-300 ${
            !canSpin
              ? "border-red-500/20 bg-gray-900/50 cursor-not-allowed opacity-50"
              : "border-white/10 bg-black hover:border-cyan-500/40"
          }`}
        >
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-sm font-black tracking-[0.6em] uppercase">
              {isSpinning
                ? "Forging Crystal..."
                : !canSpin
                ? "Limit Reached"
                : "FR Spin"}
            </span>
          </div>

          {isSpinning && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_cyan]"
            />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default SpinSystem;
