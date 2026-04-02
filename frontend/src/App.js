import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useWallet } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import CreateGroup from './pages/CreateGroup';
import Profile from './pages/Profile';
import ConnectWallet from './components/ConnectWallet';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isConnected, isConnecting } = useWallet();

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isConnected) {
    return <ConnectWallet />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          <Route path="/create-group" element={<CreateGroup />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
