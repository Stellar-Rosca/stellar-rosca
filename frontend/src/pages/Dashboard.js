import React from 'react';
import { useQuery } from 'react-query';
import { useWallet } from '../contexts/WalletContext';
import { membersAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { publicKey } = useWallet();

  const { data: userGroups, isLoading } = useQuery(
    'userGroups',
    () => membersAPI.getGroups(publicKey),
    {
      enabled: !!publicKey,
    }
  );

  const { data: balance } = useQuery(
    'userBalance',
    async () => {
      const { getBalance } = await import('../contexts/WalletContext');
      const walletContext = require('../contexts/WalletContext').useWallet();
      return walletContext.getBalance();
    },
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
  const userBalance = balance || 0;

  const stats = [
    {
      title: 'Active Groups',
      value: groups.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Contributions',
      value: groups.reduce((sum, group) => sum + (group.contribution_amount || 0), 0),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Wallet Balance',
      value: userBalance,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Next Payout',
      value: 'N/A',
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your ROSCA activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {typeof stat.value === 'number' ? stat.value.toFixed(2) : stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Groups</CardTitle>
          </CardHeader>
          <CardContent>
            {groups.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No groups yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Join existing groups or create your own to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.slice(0, 3).map((group, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Members: {group.current_members}/{group.max_members}</p>
                      <p>Contribution: {group.contribution_amount} XLM</p>
                      <p>Round: {group.current_round}/{group.total_rounds}</p>
                    </div>
                  </div>
                ))}
                {groups.length > 3 && (
                  <p className="text-sm text-center text-gray-500">
                    And {groups.length - 3} more groups
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <a
                href="/create-group"
                className="block w-full btn-primary text-center"
              >
                Create New Group
              </a>
              <a
                href="/groups"
                className="block w-full btn-secondary text-center"
              >
                Browse Groups
              </a>
              <a
                href="/profile"
                className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 text-center"
              >
                View Profile
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
