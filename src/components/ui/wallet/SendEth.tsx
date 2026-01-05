"use client";

import { useCallback, useMemo, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  scroll,
  shape,
  zkSync,
  zora,
} from "wagmi/chains";
import { Button } from "../Button";
import { truncateAddress } from "../../../lib/truncateAddress";

export function SendEth() {
  // --- Hooks ---
  const { isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // --- Recipient address by chain ---
  const protocolGuildRecipientAddress = useMemo(() => {
    switch (chainId) {
      case mainnet.id:
        return "0x25941dC771bB64514Fc8abBce970307Fb9d477e9";
      case arbitrum.id:
        return "0x7F8DCFd764bA8e9B3BA577dC641D5c664B74c47b";
      case base.id:
        return "0xd16713A5D4Eb7E3aAc9D2228eB72f6f7328FADBD";
      case optimism.id:
        return "0x58ae0925077527a87D3B785aDecA018F9977Ec34";
      case polygon.id:
        return "0xccccEbdBdA2D68bABA6da99449b9CA41Dba9d4FF";
      case scroll.id:
        return "0xccccEbdBdA2D68bABA6da99449b9CA41Dba9d4FF";
      case shape.id:
        return "0x700fccD433E878F1AF9B64A433Cb2E09f5226CE8";
      case zkSync.id:
        return "0x9fb5F754f5222449F98b904a34494cB21AADFdf8";
      case zora.id:
        return "0x32e3C7fD24e175701A35c224f2238d18439C7dBC";
      default:
        return "0x25941dC771bB64514Fc8abBce970307Fb9d477e9";
    }
  }, [chainId]);

  // --- Send ETH ---
  const sendEthTransaction = useCallback(async () => {
    if (!walletClient || !isConnected || !chainId) return;

    try {
      setIsPending(true);
      setError(null);

      const hash = await walletClient.sendTransaction({
        to: protocolGuildRecipientAddress,
        value: 10_000_000_000_000n, // 0.00001 ETH (safe for UX)
        chain: walletClient.chain,
      });

      setTxHash(hash);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
    }
  }, [walletClient, isConnected, chainId, protocolGuildRecipientAddress]);

  // --- Render ---
  return (
    <>
      <Button
        onClick={sendEthTransaction}
        disabled={!isConnected || isPending}
        isLoading={isPending}
      >
        Send ETH
      </Button>

      {error && (
        <div className="mt-2 text-xs text-red-500">{error.message}</div>
      )}

      {txHash && (
        <div className="mt-2 text-xs">
          <div>Hash: {truncateAddress(txHash)}</div>
          <div>Status: Submitted</div>
        </div>
      )}
    </>
  );
}
