"use client";

import React, { useState, useEffect } from "react";
import {
  Info,
  ArrowDown,
  Wallet,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { TOKEN_SWAP_ABI } from "../../../../abi";

// --- Configuration & Constants ---
const SWAP_CONTRACT_ADDRESS =
  "0x587b8e5EcbF00D19ab18cb3c17efC0509d51E655" as const;
const FR_TOKEN_ADDRESS = "0x402b7796bd6d27b61677a325185453ca60dfe2a8" as const;
const USDT_TOKEN_ADDRESS =
  "0x833589fCD6eDb6E08f4c7C32D4f71b1566469c3d" as const;

const FR_DECIMALS = 18;
const USDT_DECIMALS = 6;

const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const SwapTab: React.FC = () => {
  const [sellAmount, setSellAmount] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const { address, isConnected } = useAccount();

  // --- Blockchain Data Fetching ---
  const { data: frBalance, refetch: refetchFr } = useBalance({
    address,
    token: FR_TOKEN_ADDRESS,
  });
  const { data: usdtBalance, refetch: refetchUsdt } = useBalance({
    address,
    token: USDT_TOKEN_ADDRESS,
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: FR_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, SWAP_CONTRACT_ADDRESS] : undefined,
  });

  const { data: frToUsdtRate } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: "frToUsdtRate",
  });

  // --- Logic & Calculations ---
  const parsedSellAmount =
    sellAmount && !isNaN(Number(sellAmount))
      ? parseUnits(sellAmount, FR_DECIMALS)
      : 0n;
  const userFrBalanceRaw = frBalance?.value ?? 0n;
  const isBalanceLow = parsedSellAmount > userFrBalanceRaw;

  // Output estimation
  const { data: receiveAmountRaw } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: "calculateUSDTAfterFee",
    args:
      parsedSellAmount > 0n && !isBalanceLow ? [parsedSellAmount] : undefined,
    query: { enabled: parsedSellAmount > 0n && !isBalanceLow },
  });

  // Validation check
  const { data: canSwapResponse } = useReadContract({
    address: SWAP_CONTRACT_ADDRESS,
    abi: TOKEN_SWAP_ABI,
    functionName: "canSwap",
    args:
      address && parsedSellAmount > 0n && !isBalanceLow
        ? [address, parsedSellAmount]
        : undefined,
    query: { enabled: !!address && parsedSellAmount > 0n && !isBalanceLow },
  });

  const [canSwap, swapReason] = (canSwapResponse as [boolean, string]) || [
    false,
    "",
  ];

  // --- Transaction Handling ---
  const { writeContractAsync: writeApprove, isPending: isApproveLoading } =
    useWriteContract();
  const {
    writeContractAsync: writeSwap,
    data: txHash,
    isPending: isSwapLoading,
  } = useWriteContract();
  const { isLoading: isWaitingTx, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isTxSuccess) {
      setStatusMessage({
        type: "success",
        text: "Swap completed successfully!",
      });
      setSellAmount("");
      refetchFr();
      refetchUsdt();
      refetchAllowance();
      setTimeout(() => setStatusMessage(null), 5000);
    }
  }, [isTxSuccess, refetchFr, refetchUsdt, refetchAllowance]);

  const isApproved =
    allowance !== undefined && parsedSellAmount > 0n
      ? (allowance as bigint) >= parsedSellAmount
      : false;
  const isBusy = isApproveLoading || isSwapLoading || isWaitingTx;

  const handleAction = async () => {
    if (isBusy || isBalanceLow) return;
    try {
      setStatusMessage(null);
      if (!isApproved) {
        await writeApprove({
          address: FR_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [SWAP_CONTRACT_ADDRESS, parsedSellAmount],
        });
        refetchAllowance();
      } else {
        await writeSwap({
          address: SWAP_CONTRACT_ADDRESS,
          abi: TOKEN_SWAP_ABI,
          functionName: "swapFRForUSDT",
          args: [parsedSellAmount],
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.shortMessage || "Transaction execution failed",
      });
    }
  };

  return (
    <div className="flex items-center justify-center bg-[#010409] p-6 text-white selection:bg-blue-500/30">
      <div className="w-full max-w-[440px] relative">
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative bg-[#0d1117]/90 backdrop-blur-2xl border border-gray-800/60 rounded-[35px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* HEADER SECTION */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-extrabold text-2xl tracking-tight bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent">
                Swap Assets
              </h2>
              <div className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Market Exchange
              </div>
            </div>
            <button className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400">
              <Settings2 size={20} />
            </button>
          </div>

          {/* Sell Input Card */}
          <div
            className={`group transition-all duration-300 p-5 rounded-[24px] border ${
              isBalanceLow
                ? "border-red-500/40 bg-red-500/5"
                : "border-gray-800/60 bg-[#161b22]/40 hover:bg-[#161b22] hover:border-gray-700"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                You Pay
              </span>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-900/50 px-2 py-1 rounded-lg">
                <Wallet size={12} className="text-blue-500" />
                <span className="font-mono">
                  {frBalance?.formatted.slice(0, 8) || "0.00"}
                </span>
                <span className="text-[10px] text-gray-600">FR</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                placeholder="0.0"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="bg-transparent text-4xl font-bold outline-none w-full placeholder-gray-800"
              />
              <div className="flex items-center gap-2 bg-[#0d1117] px-4 py-2.5 rounded-2xl border border-gray-700 shadow-lg">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center border border-gray-600 relative">
                  <img
                    src="/icon.png"
                    alt="FR"
                    className="w-full h-full object-cover z-10"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span className="absolute text-[10px] font-black italic text-white">
                    FR
                  </span>
                </div>
                <span className="font-bold text-sm">FR</span>
              </div>
            </div>
          </div>

          {/* Direction Divider */}
          <div className="flex justify-center -my-4 relative z-20">
            <div className="bg-[#0d1117] p-2.5 rounded-2xl border-[6px] border-[#010409] shadow-xl">
              <ArrowDown size={18} className="text-blue-500" />
            </div>
          </div>

          {/* Receive Input Card */}
          <div className="bg-[#161b22]/40 border border-gray-800/60 p-5 rounded-[24px] mb-6 mt-1 hover:bg-[#161b22] transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                You Receive
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-bold uppercase">
                Estimated
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                readOnly
                value={
                  receiveAmountRaw
                    ? formatUnits(receiveAmountRaw as bigint, USDT_DECIMALS)
                    : "0.00"
                }
                className="bg-transparent text-4xl font-bold outline-none w-full text-gray-500"
              />
              <div className="flex items-center gap-2 bg-[#0d1117] px-4 py-2.5 rounded-2xl border border-gray-700 shadow-lg">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-green-600 flex items-center justify-center border border-gray-600 relative">
                  <img
                    src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png"
                    alt="USDT"
                    className="w-full h-full object-cover z-10"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                  <span className="absolute text-[10px] font-black text-white">
                    U
                  </span>
                </div>
                <span className="font-bold text-sm tracking-tight">USDT</span>
              </div>
            </div>
          </div>

          {/* Alerts & Messages */}
          <div className="space-y-3 mb-6">
            {isBalanceLow && sellAmount && (
              <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs animate-in slide-in-from-top-2">
                <AlertCircle size={16} />
                <p className="font-medium">
                  Insufficient balance in your wallet.
                </p>
              </div>
            )}

            {!canSwap && swapReason && !isBalanceLow && sellAmount && (
              <div className="flex items-center gap-3 p-3.5 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 text-xs">
                <Info size={16} />
                <p className="font-medium">{swapReason}</p>
              </div>
            )}

            {statusMessage && (
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold animate-in zoom-in-95 ${
                  statusMessage.type === "success"
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}
              >
                {statusMessage.type === "success" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                {statusMessage.text}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleAction}
            disabled={
              isBusy || isBalanceLow || !sellAmount || (isApproved && !canSwap)
            }
            className={`w-full py-4 rounded-[22px] font-black text-lg tracking-tight transition-all active:scale-[0.97] shadow-2xl relative overflow-hidden group ${
              !isConnected
                ? "bg-gray-800 text-gray-500"
                : isBalanceLow
                ? "bg-red-900/30 text-red-400 border border-red-500/20 cursor-not-allowed"
                : isBusy
                ? "bg-gray-800 text-gray-400 cursor-wait"
                : !isApproved
                ? "bg-gradient-to-r from-pink-600 to-rose-500 hover:shadow-pink-500/25 text-white"
                : "bg-gradient-to-r from-blue-600 to-indigo-500 hover:shadow-blue-500/25 text-white"
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isBusy && <RefreshCw size={22} className="animate-spin" />}
              {!isConnected
                ? "Connect Wallet"
                : isBalanceLow
                ? "Insufficient Funds"
                : isBusy
                ? "Processing..."
                : !isApproved
                ? "Approve Tokens"
                : "Confirm Exchange"}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
          </button>
        </div>

        {/* Brand Footer */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            Powered by Web3 Security
          </p>
        </div>
      </div>
    </div>
  );
};
