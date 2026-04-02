import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { groupsAPI, membersAPI, contractAPI } from '../services/api';
import { useWallet } from '../contexts/WalletContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Users, DollarSign, Calendar, Clock, TrendingUp, Play } from 'lucide-react';

const GroupDetail = () => {
  const { groupId } = useParams();
  const { publicKey, signTransaction } = useWallet();
  const [isContributing, setIsContributing] = useState(false);

  const { data: groupData, isLoading: groupLoading } = useQuery(
    ['group', groupId],
    () => groupsAPI.getById(groupId),
    {
      enabled: !!groupId,
    }
  );

  const { data: memberData, isLoading: memberLoading } = useQuery(
    ['memberContributions', publicKey, groupId],
    () => membersAPI.getContributions(publicKey, groupId),
    {
      enabled: !!publicKey && !!groupId,
    }
  );

  const group = groupData?.data;
  const contributions = memberData?.data;

  const handleJoinGroup = async () => {
    try {
      const response = await contractAPI.joinGroup({
        groupId,
        member: publicKey,
      });

      if (response.data?.transactionXDR) {
        const signedTx = await signTransaction(response.data.transactionXDR);
        // Submit signed transaction
      }

      toast.success('Successfully joined the group!');
      // Refetch data
      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Failed to join group');
    }
  };

  const handleContribute = async () => {
    try {
      setIsContributing(true);

      const response = await contractAPI.contribute({
        groupId,
        member: publicKey,
      });

      if (response.data?.transactionXDR) {
        const signedTx = await signTransaction(response.data.transactionXDR);
        // Submit signed transaction
      }

      toast.success('Contribution made successfully!');
      // Refetch data
      window.location.reload();
    } catch (error) {
      toast.error(error.message || 'Failed to make contribution');
    } finally {
      setIsContributing(false);
    }
  };

  if (groupLoading || memberLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Group not found</h2>
        <p className="text-gray-600 mt-2">The group you're looking for doesn't exist.</p>
      </div>
    );
  }

  const isMember = group.members?.includes(publicKey);
  const canContribute = isMember && group.is_active && !contributions?.rounds_paid?.includes(group.current_round);
  const progress = (group.current_round / group.total_rounds) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
        <p className="text-gray-600 mt-2">{group.description}</p>
      </div>

      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Members"
          value={`${group.current_members}/${group.max_members}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Contribution"
          value={`${group.contribution_amount} XLM`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Current Round"
          value={`${group.current_round}/${group.total_rounds}`}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Round Duration"
          value={`${Math.round(group.round_duration / 86400)} days`}
          icon={Clock}
          color="orange"
        />
      </div>

      {/* Progress and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Group Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-stellar-blue h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Pool Size:</span>
                    <p className="font-semibold text-lg">
                      {(group.contribution_amount * group.current_members).toFixed(7)} XLM
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Payout:</span>
                    <p className="font-semibold text-lg">
                      {(group.contribution_amount * group.current_members).toFixed(7)} XLM
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Group Status</p>
                      <p className="font-medium">
                        {group.is_active ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-yellow-600">Pending</span>
                        )}
                      </p>
                    </div>
                    {!isMember && (
                      <button
                        onClick={handleJoinGroup}
                        disabled={group.current_members >= group.max_members}
                        className="btn-primary"
                      >
                        {group.current_members >= group.max_members ? 'Group Full' : 'Join Group'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Contribution Status */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Your Status</CardTitle>
            </CardHeader>
            <CardContent>
              {isMember ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Contributed</p>
                    <p className="font-semibold text-lg">
                      {contributions?.total_contributed || 0} XLM
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Rounds Paid</p>
                    <p className="font-medium">
                      {contributions?.rounds_paid?.length || 0} / {group.current_round}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Contribution Rate</p>
                    <p className="font-medium">
                      {contributions ? Math.round((contributions.rounds_paid.length / group.current_round) * 100) : 0}%
                    </p>
                  </div>

                  {canContribute && (
                    <button
                      onClick={handleContribute}
                      disabled={isContributing}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      {isContributing ? (
                        <>
                          <LoadingSpinner size="small" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          <span>Contribute Now</span>
                        </>
                      )}
                    </button>
                  )}

                  {!canContribute && isMember && (
                    <div className="text-center text-sm text-gray-600">
                      {contributions?.rounds_paid?.includes(group.current_round) 
                        ? 'Already contributed for this round'
                        : 'Cannot contribute at this time'
                      }
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-600">
                  <Users size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>Join this group to see your contribution status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Group Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.members?.map((member, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-stellar-blue rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {member.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {member.slice(0, 6)}...{member.slice(-4)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member === group.admin ? 'Admin' : 'Member'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupDetail;
