
'use client';

/**
 * @fileOverview Institutional Web3 Connection Node.
 * Manages the lifecycle of Web3Auth and MetaMask wallet connections.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, IProvider } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { BrowserProvider, formatEther, parseEther } from "ethers";

interface Web3ContextType {
  provider: IProvider | null;
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isInitializing: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  sendTransaction: (to: string, amount: string) => Promise<string | null>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

const clientId = "BPgebSLolYQp83tKNqVg4fYcBIewpwInqPfRVsyEYDTSzgoz6W-45C5x7p6LjFvKyTDCx-IpbaaAAFjeBjLymoU";

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: "0xaa36a7", // Sepolia Testnet (for Devnet environment)
          rpcTarget: "https://rpc.ankr.com/eth_sepolia",
          displayName: "Ethereum Sepolia Testnet",
          blockExplorerUrl: "https://sepolia.etherscan.io",
          ticker: "ETH",
          tickerName: "Ethereum",
        };

        const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
        });

        // Add MetaMask Adapter
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig,
        });

        web3authInstance.configureAdapter(metamaskAdapter);
        setWeb3auth(web3authInstance);

        await web3authInstance.initModal();
        
        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider);
          await getUserInfo(web3authInstance.provider);
        }
      } catch (error) {
        console.error("Web3Auth Initialization Failure:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    init();
  }, []);

  const getUserInfo = async (p: IProvider) => {
    const ethersProvider = new BrowserProvider(p);
    const signer = await ethersProvider.getSigner();
    const addr = await signer.getAddress();
    const bal = await ethersProvider.getBalance(addr);
    
    setAddress(addr);
    setBalance(formatEther(bal));
  };

  const login = async () => {
    if (!web3auth) return;
    try {
      const web3authProvider = await web3auth.connect();
      if (web3authProvider) {
        setProvider(web3authProvider);
        await getUserInfo(web3authProvider);
      }
    } catch (error) {
      console.error("Login Failure:", error);
    }
  };

  const logout = async () => {
    if (!web3auth) return;
    try {
      await web3auth.logout();
      setProvider(null);
      setAddress(null);
      setBalance(null);
    } catch (error) {
      console.error("Logout Failure:", error);
    }
  };

  const sendTransaction = async (to: string, amount: string): Promise<string | null> => {
    if (!provider) return null;
    try {
      const ethersProvider = new BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      
      const tx = await signer.sendTransaction({
        to,
        value: parseEther(amount),
      });

      const receipt = await tx.wait();
      return receipt?.hash || null;
    } catch (error) {
      console.error("Transaction Transmission Failure:", error);
      return null;
    }
  };

  return (
    <Web3Context.Provider 
      value={{ 
        provider, 
        address, 
        balance, 
        isConnected: !!provider, 
        isInitializing, 
        login, 
        logout,
        sendTransaction
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) throw new Error("useWeb3 must be used within a Web3AuthProvider");
  return context;
}
