"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Text,
  Environment,
  Float,
  Sparkles,
  PerspectiveCamera,
  ContactShadows,
  MeshTransmissionMaterial,
  Image,
  useProgress,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useReadContract,
} from "wagmi";
import { parseEther } from "viem";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { abi } from "../../../../abi";
import { base } from "viem/chains";
// import { baseSepolia } from "viem/chains";

// --- Configuration ---
const NFT_CONTRACT_ADDRESS = "0x56a76F3ADe8b686B61f6aDbE53e0f5CAe77696a4"; // main
// const NFT_CONTRACT_ADDRESS = "0x7978Eb427C0481F657b6B6835544D69b6C3bC82d"; //testnet main ta
// const NFT_CONTRACT_ADDRESS = "0x3Da2ab5902593e6a9d55C6Ece4AFab1Cc3c7A2e2"; //testnet main ta
const MINT_PRICE = "0.0001"; // ETH

const NFT_ABI = abi;

// --- Toast Component ---
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-green-500/10",
      border: "border-green-500/50",
      text: "text-green-400",
      Icon: CheckCircle,
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/50",
      text: "text-red-400",
      Icon: XCircle,
    },
    info: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/50",
      text: "text-cyan-400",
      Icon: Loader2,
    },
  };

  const { bg, border, text, Icon } =
    config[type as keyof typeof config] || config.info;

  return (
    <motion.div
      // ডান দিক থেকে স্লাইড হয়ে আসবে
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
      // টপ-রাইট পজিশনিং
      className={`fixed top-4 right-4 z-[999] 
                  w-[calc(100%-32px)] max-w-[350px] md:w-[380px]
                  flex items-center gap-4 px-5 py-4 rounded-xl border ${border} ${bg} backdrop-blur-xl shadow-2xl shadow-black/50`}
    >
      {/* গ্লোয়িং আইকন সেকশন */}
      <div className="flex-shrink-0">
        <motion.div
          animate={type === "info" ? { rotate: 360 } : {}}
          transition={
            type === "info"
              ? { repeat: Infinity, duration: 2, ease: "linear" }
              : {}
          }
        >
          <Icon
            className={`w-5 h-5 ${text} drop-shadow-[0_0_8px_currentColor]`}
          />
        </motion.div>
      </div>

      {/* টেক্সট সেকশন */}
      <div className="flex-grow min-w-0">
        <p
          className={`text-[9px] uppercase tracking-[0.2em] font-black opacity-50 ${text} mb-0.5`}
        >
          System Notification
        </p>
        <p className="text-xs md:text-sm font-mono text-white/90 leading-relaxed break-words">
          {message}
        </p>
      </div>

      {/* ক্লোজ বাটন */}
      <button
        onClick={onClose}
        className="flex-shrink-0 self-start p-1 hover:bg-white/10 rounded-lg transition-colors"
      >
        <span className="text-white/40 hover:text-white text-lg leading-none">
          ✕
        </span>
      </button>

      {/* নিচের এনিমেটেড প্রগ্রেস বার */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
        className={`absolute bottom-0 left-0 h-[2px] rounded-full ${text.replace(
          "text",
          "bg"
        )}`}
      />
    </motion.div>
  );
};

// --- Loader Component ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#02040a] font-mono">
        <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-cyan-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-cyan-500 text-[10px] mt-4 tracking-[0.5em] uppercase animate-pulse">
          Initializing Protocol {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

// --- Types ---
interface NFTItem {
  name: string;
  rarity: string;
  color: string;
  icon: string;
  desc: string;
}

const NFT_DATA: NFTItem[] = [
  {
    name: "FR MYTHIC",
    rarity: "MYTHIC",
    color: "#bd00ff",
    icon: "/mytic.png",
    desc: "NEURAL NETWORK",
  },
  {
    name: "FR PLATINUM",
    rarity: "LEGENDARY",
    color: "#00d4ff",
    icon: "/legendry.png",
    desc: "QUANTUM ENCRYPTED",
  },
  {
    name: "FR GOLD",
    rarity: "EPIC",
    color: "#FFB300",
    icon: "/epic.png",
    desc: "HIGH FREQUENCY",
  },
  {
    name: "FR SILVER",
    rarity: "RARE",
    color: "#C0C0C0",
    icon: "/rare.png",
    desc: "STELLAR PULSE",
  },
  {
    name: "FR BRONZE",
    rarity: "COMMON",
    color: "#CD7F32",
    icon: "/common.png",
    desc: "CORE ACCESS",
  },
];

// --- CyberBox ---
const CyberBox = ({
  opened,
  isMobile,
  color,
}: {
  opened: boolean;
  isMobile: boolean;
  color: string;
}) => {
  const boxRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (boxRef.current) {
      boxRef.current.rotation.y = t * 0.15;
      boxRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;

      const targetY = opened ? (isMobile ? -4.5 : -3.5) : 0;
      boxRef.current.position.y = THREE.MathUtils.lerp(
        boxRef.current.position.y,
        targetY,
        0.06
      );

      const baseScale = isMobile ? 1.2 : 1.1;
      const s = opened ? 0 : baseScale;

      boxRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);

      if (opened && boxRef.current.scale.x < 0.01) {
        boxRef.current.visible = false;
      } else {
        boxRef.current.visible = true;
      }
    }
  });

  return (
    <group ref={boxRef}>
      <mesh>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshStandardMaterial color="#02040a" metalness={1} roughness={0.3} />
      </mesh>

      <mesh>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <MeshTransmissionMaterial
          backside
          samples={isMobile ? 2 : 4}
          thickness={0.1}
          chromaticAberration={0.02}
          distortion={0.2}
          color={color}
          opacity={0.3}
          transparent
        />
      </mesh>

      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[(i * Math.PI) / 2, (i * Math.PI) / 4, 0]}>
          <mesh>
            <boxGeometry args={[1.65, 0.02, 1.65]} />
            <meshBasicMaterial color={color} transparent opacity={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// --- RelicCard ---
const RelicCard = ({
  opened,
  data,
  isMobile,
}: {
  opened: boolean;
  data: NFTItem;
  isMobile: boolean;
}) => {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    if (opened) {
      const targetY = isMobile ? 0.2 : 0.6;
      group.current.position.y = THREE.MathUtils.lerp(
        group.current.position.y,
        targetY,
        0.08
      );
      group.current.rotation.y = Math.sin(t * 0.4) * 0.15;

      const scaleVal = isMobile ? 1.4 : 1.2;
      group.current.scale.lerp(
        new THREE.Vector3(scaleVal, scaleVal, scaleVal),
        0.1
      );
    } else {
      group.current.position.y = -5;
      group.current.scale.set(0, 0, 0);
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <boxGeometry args={[1.2, 1.8, 0.05]} />
          <MeshTransmissionMaterial
            backside
            samples={isMobile ? 3 : 6}
            thickness={0.2}
            color={data.color}
          />
        </mesh>
        <group position={[0, 0, 0.04]}>
          <Text
            position={[0, 0.7, 0]}
            fontSize={0.06}
            color={data.color}
            letterSpacing={0.3}
          >
            {data.rarity}
          </Text>

          <Image
            url={data.icon}
            transparent
            scale={[0.7, 0.7]}
            position={[0, 0.15, 0.01]}
          />

          <Text
            position={[0, -0.4, 0]}
            fontSize={isMobile ? 0.14 : 0.15}
            color="white"
            fontWeight="bold"
          >
            {data.name}
          </Text>
        </group>
      </Float>
    </group>
  );
};

export default function PremiumVaultPage() {
  const [opened, setOpened] = useState(false);
  const [activeNFT, setActiveNFT] = useState<NFTItem>(NFT_DATA[0]);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(
    null
  );

  // const [canMintToday, setCanMintToday] = useState(false);
  // const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const { address, isConnected } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  // use can mint or not 24 hours
  const { data: isCanMint, isLoading: isCanMintLoading } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: abi,
    functionName: "canMint",
    args: [address],
  });

  // use can mint time management
  const { data: timeUntilNextMint, isLoading: timeUntilNextMintLoading } =
    useReadContract({
      address: NFT_CONTRACT_ADDRESS,
      abi: abi,
      functionName: "timeUntilNextMint",
      args: [address],
    });
  const timeLeft = timeUntilNextMint ? Number(timeUntilNextMint) : 0;

  // Wagmi hooks

  const {
    data: hash,
    writeContract,
    isPending: isMintPending,
    error: mintError,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Check mint eligibility when wallet connects
  // useEffect(() => {
  //   if (address && isConnected) {
  //     checkMintEligibility();
  //   }
  // }, [address, isConnected]);

  // Handle mint errors
  useEffect(() => {
    if (mintError) {
      showToast(mintError.message || "Transaction failed", "error");
      setIsMinting(false);
    }
  }, [mintError]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirming) {
      showToast("Transaction confirming...", "info");
    }
  }, [isConfirming]);

  // Handle successful mint
  useEffect(() => {
    if (isConfirmed && hash) {
      setOpened(true);
      saveMintToBackend(hash);
    }

    // if mint error no open box
    if (mintError) {
      setOpened(false);
      setIsMinting(false);
    }
  }, [isConfirmed, hash]);

  const showToast = (message: string, type: string) => {
    setToast({ message, type });
  };

  // const checkMintEligibility = async () => {
  //   if (!address) return;

  //   setCheckingEligibility(true);
  //   try {
  //     const response = await fetch(`/check-mint-eligibility`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ walletAddress: address }),
  //     });

  //     const data = await response.json();
  //     setCanMintToday(data.canMint);

  //     if (!data.canMint) {
  //       showToast(
  //         "You have already minted today. Come back tomorrow!",
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error checking eligibility:", error);
  //     showToast("Failed to check mint eligibility", "error");
  //     setCanMintToday(true); // Allow attempt if check fails
  //   } finally {
  //     setCheckingEligibility(false);
  //   }
  // };

  const saveMintToBackend = async (txHash: string) => {
    try {
      const response = await fetch(`/api/save-mint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          transactionHash: txHash,
          contractAddress: NFT_CONTRACT_ADDRESS,
          mintPrice: MINT_PRICE,
          nftType: activeNFT.rarity,
          nftName: activeNFT.name,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("🎉 NFT minted successfully!", "success");
        // setCanMintToday(false);
        setIsMinting(false);
      } else {
        showToast(data.error || "Failed to save mint data", "error");
        setIsMinting(false);
      }
    } catch (error) {
      console.error("Backend save error:", error);
      showToast("Mint successful but failed to save data", "error");
      setIsMinting(false);
    }
  };

  const handleMint = async () => {
    if (!isConnected) {
      showToast("Please connect your wallet first", "error");
      return;
    }

    // if (!canMintToday && !checkingEligibility) {
    //   showToast("You can only mint once per day", "error");
    //   return;
    // }

    if (isMinting || isMintPending || isConfirming) {
      return;
    }

    try {
      setIsMinting(true);

      // Select random NFT
      const selectedNFT = NFT_DATA[Math.floor(Math.random() * NFT_DATA.length)];
      setActiveNFT(selectedNFT);

      showToast("Preparing transaction...", "info");

      // // Open vault animation
      // setOpened(true);

      // // Wait a bit for animation
      // await new Promise((resolve) => setTimeout(resolve, 1000));

      //testnet check system
      // await switchChainAsync({
      //   chainId: baseSepolia.id,
      // });

      //mainnet
      await switchChainAsync({
        chainId: base.id,
      });

      // Initiate mint transaction
      writeContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: NFT_ABI,
        functionName: "mint",
        value: parseEther(MINT_PRICE),
      });
    } catch (error: any) {
      console.error("Mint error:", error);
      showToast(error.message || "Failed to initiate mint", "error");
      setIsMinting(false);
      setOpened(false);
    }
  };

  const closeVault = () => {
    setOpened(false);
  };

  const getMintButtonText = () => {
    if (!isConnected) return "Connect Wallet";
    // if (checkingEligibility) return "Checking...";
    if (isMintPending) return "Confirm in Wallet...";
    if (isConfirming) return "Confirming...";
    if (isMinting) return "Minting...";
    if (isCanMint) return "Mint Now";
    if (!isCanMint) return "Already Minted Today";
    if (opened) return "Close Vault";
    return "Mint FR NFT";
  };

  const isButtonDisabled = () => {
    return (
      !isConnected ||
      // checkingEligibility ||
      isMintPending ||
      isConfirming ||
      isMinting ||
      (!isCanMint && !opened) ||
      isCanMintLoading
    );
  };

  return (
    <div className="h-[80dvh] w-full flex flex-col items-center justify-between overflow-hidden font-mono selection:bg-cyan-500 relative ">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="relative z-10 md:pt-12 text-center pointer-events-none">
        <h1 className="text-white text-2xl md:text-4xl font-black tracking-[0.15em] md:tracking-[0.2em] mb-1 opacity-90 transition-all duration-500">
          Mint Live
          <span className="animate-pulse" style={{ color: activeNFT.color }}>
            .
          </span>
        </h1>
        <p className="text-[8px] md:text-xs text-white/50 tracking-[0.4em] uppercase">
          Mint <span className="text-cyan-400">FarRewards</span> NFT
        </p>
        <div className="h-[1px] w-16 md:w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-4" />
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0 bottom-20 top-0">
        <Canvas shadows dpr={[1, 2]}>
          <Suspense fallback={<Loader />}>
            <PerspectiveCamera
              makeDefault
              position={[0, 0, isMobile ? 10 : 7]}
              fov={isMobile ? 45 : 40}
            />
            <ambientLight intensity={0.4} />
            <Environment preset="city" />
            <CyberBox
              opened={opened}
              isMobile={isMobile}
              color={activeNFT.color}
            />
            <RelicCard opened={opened} data={activeNFT} isMobile={isMobile} />
            <Sparkles
              count={opened ? (isMobile ? 50 : 100) : 20}
              scale={6}
              size={2}
              color={activeNFT.color}
            />
            <ContactShadows
              position={[0, -2.5, 0]}
              opacity={0.4}
              scale={10}
              blur={2.5}
              color={activeNFT.color}
            />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={!opened}
              autoRotateSpeed={0.5}
              makeDefault
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 pb-10 md:pb-12 flex flex-col items-center gap-4 w-full px-6 md:px-8">
        {opened && (
          <div className="text-center mb-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <p className="text-[10px] text-cyan-400 tracking-[0.3em] uppercase mb-2">
              {activeNFT.desc}
            </p>
            <p className="text-xs text-white/60 tracking-wider">
              Price: {MINT_PRICE} ETH
            </p>
          </div>
        )}

        <button
          onClick={opened ? closeVault : handleMint}
          disabled={isButtonDisabled()}
          className="group relative w-full max-w-[240px] md:max-w-[280px] py-4 md:py-5 bg-[#00050a]/80 backdrop-blur-sm border border-white/10 active:scale-95 transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-400/30 group-hover:bg-cyan-400 transition-colors" />

          <span className="relative text-[10px] md:text-[11px] font-bold tracking-[0.5em] uppercase text-white group-hover:text-cyan-400 transition-colors flex items-center justify-center gap-2">
            {(isMintPending || isConfirming || isMinting) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {getMintButtonText()}
          </span>

          <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        {!isCanMint && isConnected && (
          <p className="text-[10px] text-yellow-400/80 uppercase tracking-wider animate-pulse">
            <span className="text-red-500 flex justify-center">
              {timeUntilNextMintLoading ? "Time Loading..." : timeLeft}
            </span>{" "}
            <br />
            <span>⏰ Come back tomorrow to mint again</span>
          </p>
        )}

        <p className="text-[8px] text-white/20 uppercase tracking-widest">
          Protocol v4.0.2 - {isConnected ? "Connected" : "Disconnected"}
        </p>
      </div>

      {/* Scan Line Animation */}
      <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/5 animate-scan pointer-events-none z-30" />

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0%;
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        .animate-scan {
          animation: scan 10s linear infinite;
        }
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
