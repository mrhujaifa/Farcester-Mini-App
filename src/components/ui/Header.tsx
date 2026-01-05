"use client";

import { useState } from "react";
import { APP_NAME } from "~/lib/constants";
import sdk from "@farcaster/miniapp-sdk";
import { useMiniApp } from "@neynar/react";
import Image from "next/image";
import AppIcon from "../../../public/icon.png";

type HeaderProps = {
  neynarUser?: {
    fid: number;
    score: number;
  } | null;
};

export function Header({ neynarUser }: HeaderProps) {
  const { context } = useMiniApp();
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <div className="relative px-4 mt-4">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl ">
        {/* Gradient Glow */}
        <div className="absolute inset-0 " />

        <div className="relative flex items-center justify-between px-4 py-3">
          {/* Left: App info */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full  p-[2px]">
              <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center">
                <Image src={AppIcon} alt="App" width={30} height={30} />
              </div>
            </div>

            <div className="leading-tight">
              <p className="text-md font-extrabold tracking-tight">
                <span className="animated-gradient-text">{APP_NAME}</span>
              </p>

              <p className="text-[10px] uppercase tracking-wider text-[#94A3B8]">
                Premium Mining
              </p>
            </div>
          </div>

          {/* Right: User */}
          {context?.user && (
            <div className="flex items-center gap-3">
              {/* Dark mode / status icon */}
              <div className="w-9 h-9 rounded-full bg-[#020617] border border-[#1E293B] flex items-center justify-center text-[#94A3B8]">
                🌙
              </div>

              {/* Wallet / User chip */}
              <div
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#020617] border border-[#1E293B] hover:border-[#38BDF8] transition"
              >
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-xs font-mono text-[#E5E7EB]">
                  0x{context.user.fid.toString().slice(0, 4)}...
                  {context.user.fid.toString().slice(-2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown (unchanged logic, improved UI) */}
      {context?.user && isUserDropdownOpen && (
        <div className="absolute right-4 top-full mt-3 z-50 w-56 rounded-2xl bg-[#020617] border border-[#1E293B] shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
          <div className="p-4 space-y-3">
            <div>
              <p
                onClick={() =>
                  sdk.actions.viewProfile({ fid: context.user.fid })
                }
                className="text-sm font-semibold text-white hover:text-[#38BDF8] cursor-pointer"
              >
                {context.user.displayName || context.user.username}
              </p>
              <p className="text-xs text-[#94A3B8]">@{context.user.username}</p>
            </div>

            <div className="border-t border-[#1E293B] pt-3 space-y-1 text-xs">
              <div className="flex justify-between text-[#94A3B8]">
                <span>FID</span>
                <span className="text-white">{context.user.fid}</span>
              </div>

              {neynarUser && (
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Score</span>
                  <span className="text-[#22C55E] font-mono">
                    +{neynarUser.score.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() => sdk.actions.viewProfile({ fid: context.user.fid })}
              className="w-full rounded-xl bg-gradient-to-r from-[#38BDF8] to-[#22D3EE] py-2 text-xs font-bold text-black"
            >
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
