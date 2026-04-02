import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as freighter from '@stellar/freighter-api';
import { StellarSdk } from 'stellar-sdk';
import toast from 'react-hot-toast';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [network, setNetwork] = useState('testnet');

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      // Check if Freighter is available
      const isFreighterAvailable = await freighter.isConnected();
      if (!isFreighterAvailable) {
        toast.error('Please install Freighter wallet extension');
        return;
      }

      // Get public key
      const { address } = await freighter.getPublicKey();
      setPublicKey(address);
      setIsConnected(true);
      
      // Set network
      const { network: freighterNetwork } = await freighter.getNetwork();
      setNetwork(freighterNetwork);
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setPublicKey(null);
    toast.success('Wallet disconnected');
  }, []);

  const signTransaction = useCallback(async (transactionXDR) => {
    try {
      const { signedTransactionXDR } = await freighter.signTransaction(transactionXDR, network);
      return signedTransactionXDR;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      toast.error('Failed to sign transaction');
      throw error;
    }
  }, [network]);

  const getAccount = useCallback(async () => {
    if (!publicKey) return null;
    
    try {
      const server = new StellarSdk.Horizon.Server(
        network === 'testnet' 
          ? 'https://horizon-testnet.stellar.org' 
          : 'https://horizon.stellar.org'
      );
      
      const account = await server.loadAccount(publicKey);
      return account;
    } catch (error) {
      console.error('Failed to load account:', error);
      return null;
    }
  }, [publicKey, network]);

  const getBalance = useCallback(async () => {
    const account = await getAccount();
    if (!account) return 0;
    
    const nativeBalance = account.balances.find(
      balance => balance.asset_type === 'native'
    );
    
    return parseFloat(nativeBalance?.balance || '0');
  }, [getAccount]);

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isFreighterAvailable = await freighter.isConnected();
        if (isFreighterAvailable) {
          const { address } = await freighter.getPublicKey();
          if (address) {
            setPublicKey(address);
            setIsConnected(true);
            const { network: freighterNetwork } = await freighter.getNetwork();
            setNetwork(freighterNetwork);
          }
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    };

    checkConnection();
  }, []);

  const value = {
    isConnected,
    isConnecting,
    publicKey,
    network,
    connectWallet,
    disconnectWallet,
    signTransaction,
    getAccount,
    getBalance,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
