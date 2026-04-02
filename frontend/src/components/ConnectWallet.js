import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Wallet, Rocket } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ConnectWallet = () => {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-stellar-blue rounded-full">
                <Wallet size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Stellar ROSCA
            </h1>
            
            <p className="text-gray-600 mb-8">
              Connect your wallet to start creating and joining savings groups
            </p>
            
            <div className="space-y-4">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Rocket size={20} />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-stellar-blue mb-2">Getting Started</h3>
              <ul className="text-sm text-gray-700 space-y-1 text-left">
                <li>• Install Freighter wallet extension</li>
                <li>• Create or import your Stellar account</li>
                <li>• Connect your wallet to get started</li>
                <li>• Join existing groups or create your own</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
