"use client";

import { APP_NAME } from "~/lib/constants";
import { useMiniApp } from "@neynar/react";
import Image from "next/image";
import AppIcon from "../../../public/icon.png";
import { truncateAddress } from "~/lib/truncateAddress";
import { useAccount } from "wagmi";

type HeaderProps = {
  neynarUser?: {
    fid: number;
    score: number;
  } | null;
};

export function Header({ neynarUser }: HeaderProps) {
  const { context } = useMiniApp();

  const { address } = useAccount();

  return (
    <div className="relative px-4">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative flex items-center justify-between py-3">
          {/* Left */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full p-[2px]">
              <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center">
                <Image
                  src={context?.user?.pfpUrl || AppIcon}
                  alt="App"
                  width={40}
                  height={40}
                />
              </div>
            </div>
            <div>
              <p className="text-md font-extrabold">
                <span className="animated-gradient-text">
                  {context?.user?.displayName || APP_NAME}
                </span>
              </p>
              <p className="text-[10px] uppercase text-[#94A3B8]">
                {context?.user && (
                  <div
                    className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#020617] border border-[#1E293B] hover:border-[#38BDF8]"
                    title="Click to Disconnect Wallet"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <span className="text-xs font-mono text-[#E5E7EB]">
                      {truncateAddress(address!)}
                    </span>
                  </div>
                )}
              </p>
            </div>
          </div>

          {/* Right */}

          <div className="text-white font-mono px-3 py-1.5 rounded-full bg-[#020617] border border-[#1E293B] hover:border-[#38BDF8]">
            <button className="text-cyan-400">$FR 100</button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
    </div>
  );
}
