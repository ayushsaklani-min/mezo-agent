"use client";

import { useState, useEffect } from "react";
import { MEZO_CONFIG } from "./constants";

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isMezoTestnet: boolean;
  balanceBTC: string;
  isConnecting: boolean;
  error: string | null;
}

export function useMezoWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isMezoTestnet: false,
    balanceBTC: "0.0000",
    isConnecting: false,
    error: null,
  });

  const checkConnection = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: "eth_accounts" });
      const chainIdHex = await eth.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainIdHex, 16);

      if (accounts && accounts.length > 0) {
        setWallet({
          isConnected: true,
          address: accounts[0],
          chainId: currentChainId,
          isMezoTestnet: currentChainId === MEZO_CONFIG.chainId,
          balanceBTC: "0.0500",
          isConnecting: false,
          error: null,
        });
      }
    } catch (err: any) {
      console.warn("Wallet check error:", err);
    }
  };

  useEffect(() => {
    checkConnection();
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const eth = (window as any).ethereum;
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet((prev) => ({ ...prev, isConnected: false, address: null }));
        } else {
          setWallet((prev) => ({ ...prev, isConnected: true, address: accounts[0] }));
        }
      };
      const handleChainChanged = (chainIdHex: string) => {
        const id = parseInt(chainIdHex, 16);
        setWallet((prev) => ({
          ...prev,
          chainId: id,
          isMezoTestnet: id === MEZO_CONFIG.chainId,
        }));
      };

      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);

      return () => {
        eth.removeListener("accountsChanged", handleAccountsChanged);
        eth.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("No Ethereum wallet found. Please install MetaMask, Rabby, or use Interactive Demo Mode.");
      return;
    }

    setWallet((prev) => ({ ...prev, isConnecting: true, error: null }));
    try {
      const eth = (window as any).ethereum;
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const chainIdHex = await eth.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainIdHex, 16);

      setWallet({
        isConnected: true,
        address: accounts[0],
        chainId: currentChainId,
        isMezoTestnet: currentChainId === MEZO_CONFIG.chainId,
        balanceBTC: "0.1500",
        isConnecting: false,
        error: null,
      });

      // If not on Mezo, prompt to switch
      if (currentChainId !== MEZO_CONFIG.chainId) {
        await switchToMezo();
      }
    } catch (err: any) {
      setWallet((prev) => ({
        ...prev,
        isConnecting: false,
        error: err?.message || "Failed to connect wallet",
      }));
    }
  };

  const switchToMezo = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;
    const eth = (window as any).ethereum;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MEZO_CONFIG.chainIdHex }],
      });
      setWallet((prev) => ({
        ...prev,
        chainId: MEZO_CONFIG.chainId,
        isMezoTestnet: true,
      }));
    } catch (switchError: any) {
      // 4902 indicates chain hasn't been added yet
      if (switchError.code === 4902 || switchError?.message?.includes("Unrecognized chain")) {
        try {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: MEZO_CONFIG.chainIdHex,
                chainName: MEZO_CONFIG.name,
                nativeCurrency: {
                  name: "Bitcoin",
                  symbol: "BTC",
                  decimals: 18,
                },
                rpcUrls: [MEZO_CONFIG.rpcUrl],
                blockExplorerUrls: [MEZO_CONFIG.explorerUrl],
              },
            ],
          });
          setWallet((prev) => ({
            ...prev,
            chainId: MEZO_CONFIG.chainId,
            isMezoTestnet: true,
          }));
        } catch (addError) {
          console.error("Failed to add Mezo network:", addError);
        }
      }
    }
  };

  return {
    ...wallet,
    connectWallet,
    switchToMezo,
  };
}
