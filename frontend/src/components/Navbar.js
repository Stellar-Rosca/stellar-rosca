import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { Users, Home, PlusCircle, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { publicKey, disconnectWallet } = useWallet();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-2xl font-bold text-stellar-blue">
              Stellar ROSCA
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-stellar-blue text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home size={20} />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/groups"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/groups') 
                    ? 'bg-stellar-blue text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={20} />
                <span>Groups</span>
              </Link>
              
              <Link
                to="/create-group"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/create-group') 
                    ? 'bg-stellar-blue text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <PlusCircle size={20} />
                <span>Create Group</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {formatAddress(publicKey)}
                </span>
              </div>
            </div>
            
            <Link
              to="/profile"
              className={`p-2 rounded-md transition-colors ${
                isActive('/profile') 
                  ? 'bg-stellar-blue text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
            </Link>
            
            <button
              onClick={disconnectWallet}
              className="flex items-center space-x-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Disconnect</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
