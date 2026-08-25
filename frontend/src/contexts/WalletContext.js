import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// @stellar/freighter-api v6: named async helpers that each return an object
// (with an optional `error` field), NOT bare strings.
import {
  isConnected as freighterIsConnected,
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction as freighterSignTransaction,
} from '@stellar/freighter-api';
// stellar-sdk v12 has no `StellarSdk` named export — import the namespace.
import * as StellarSdk from 'stellar-sdk';
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
  const [network, setNetwork] = useState('TESTNET');
  const [networkPassphrase, setNetworkPassphrase] = useState(StellarSdk.Networks.TESTNET);

  // Is the Freighter extension installed & available?
  const hasFreighter = useCallback(async () => {
    try {
      const res = await freighterIsConnected();
      return !!(res && res.isConnected);
    } catch {
      return false;
    }
  }, []);

  const applyNetwork = useCallback(async () => {
    const net = await getNetworkDetails();
    if (!net.error) {
      setNetwork(net.network);
      setNetworkPassphrase(net.networkPassphrase);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);

      // Check if Freighter is available
      if (!(await hasFreighter())) {
        toast.error('Please install the Freighter wallet extension');
        return;
      }

      // Request access — this prompts the user and returns their public key
      const access = await requestAccess();
      if (access.error) {
        toast.error('Failed to connect wallet');
        return;
      }
      setPublicKey(access.address);
      setIsConnected(true);

      // Read the network Freighter is currently set to
      await applyNetwork();

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  }, [hasFreighter, applyNetwork]);

  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setPublicKey(null);
    toast.success('Wallet disconnected');
  }, []);

  const signTransaction = useCallback(async (transactionXDR) => {
    try {
      const res = await freighterSignTransaction(transactionXDR, { networkPassphrase });
      if (res.error) throw new Error(String(res.error));
      return res.signedTxXdr;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      toast.error('Failed to sign transaction');
      throw error;
    }
  }, [networkPassphrase]);

  const getServer = useCallback(() => {
    return new StellarSdk.Horizon.Server(
      network === 'PUBLIC'
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org'
    );
  }, [network]);

  const getAccount = useCallback(async () => {
    if (!publicKey) return null;

    try {
      const server = getServer();
      const account = await server.loadAccount(publicKey);
      return account;
    } catch (error) {
      console.error('Failed to load account:', error);
      return null;
    }
  }, [publicKey, getServer]);

  const getBalance = useCallback(async () => {
    const account = await getAccount();
    if (!account) return 0;

    const nativeBalance = account.balances.find(
      balance => balance.asset_type === 'native'
    );

    return parseFloat(nativeBalance?.balance || '0');
  }, [getAccount]);

  // Restore an existing connection on mount without prompting the user.
  // getAddress() (unlike requestAccess()) only returns an address if the
  // dApp was already granted access.
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!(await hasFreighter())) return;
        const res = await getAddress();
        if (res && !res.error && res.address) {
          setPublicKey(res.address);
          setIsConnected(true);
          await applyNetwork();
        }
      } catch (error) {
        console.error('Failed to check connection:', error);
      }
    };

    checkConnection();
  }, [hasFreighter, applyNetwork]);

  const value = {
    isConnected,
    isConnecting,
    publicKey,
    network,
    networkPassphrase,
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
