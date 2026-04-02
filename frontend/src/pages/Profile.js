import React from 'react';
import { useQuery } from 'react-query';
import { useWallet } from '../contexts/WalletContext';
import { membersAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { User, Mail, Calendar, TrendingUp, Award } from 'lucide-react';

const Profile = () => {
  const { publicKey, getBalance } = useWallet();

  const { data: userGroups, isLoading } = useQuery(
    'userGroups',
    () => membersAPI.getGroups(publicKey),
    {
      enabled: !!publicKey,
    }
  );

  const { data: balance } = useQuery(
    'userBalance',
    getBalance,
    {
      enabled: !!publicKey,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const groups = userGroups?.data?.groups || [];
  const currentBalance = balance || 0;

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account and view activity</p>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User size={24} />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Wallet Address</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                  {publicKey}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Display Name</p>
                <p className="font-medium">{formatAddress(publicKey)}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Network</p>
                <p className="font-medium">Testnet</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Joined</p>
                <p className="font-medium">Recently</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={24} />
              <span>Financial Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentBalance.toFixed(7)} XLM
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Total Groups</p>
                <p className="text-xl font-semibold text-gray-900">{groups.length}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Total Contributed</p>
                <p className="text-xl font-semibold text-gray-900">
                  {groups.reduce((sum, group) => sum + (group.contribution_amount || 0), 0).toFixed(7)} XLM
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Active Groups</p>
                <p className="text-xl font-semibold text-gray-900">
                  {groups.filter(group => group.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award size={24} />
            <span>Activity Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar size={32} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, group) => sum + (group.current_round || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Rounds</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp size={32} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {groups.length > 0 ? Math.round(
                  groups.reduce((sum, group) => {
                    const progress = (group.current_round / group.total_rounds) * 100;
                    return sum + progress;
                  }, 0) / groups.length
                ) : 0}%
              </p>
              <p className="text-sm text-gray-600">Avg Progress</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User size={32} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {groups.reduce((sum, group) => sum + (group.current_members || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Connections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Your Groups</CardTitle>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Groups Yet</h3>
              <p className="text-gray-600">Join existing groups or create your own to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{group.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Members: {group.current_members}/{group.max_members}</span>
                        <span>Round: {group.current_round}/{group.total_rounds}</span>
                        <span>Contribution: {group.contribution_amount} XLM</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      group.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {group.is_active ? 'Active' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
