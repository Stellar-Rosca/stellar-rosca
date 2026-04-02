import React from 'react';
import { useQuery } from 'react-query';
import { groupsAPI } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { Users, DollarSign, Calendar, Clock } from 'lucide-react';

const Groups = () => {
  const { data: groupsData, isLoading } = useQuery(
    'allGroups',
    () => groupsAPI.getAll(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  const groups = groupsData?.data?.groups || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Groups</h1>
        <p className="text-gray-600 mt-2">Join existing ROSCA groups</p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Groups Available</h3>
            <p className="text-gray-600">Be the first to create a ROSCA group!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, index) => (
            <GroupCard key={index} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

const GroupCard = ({ group }) => {
  const isActive = group.is_active;
  const progress = (group.current_round / group.total_rounds) * 100;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg truncate">{group.name}</CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isActive ? 'Active' : 'Pending'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {group.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-gray-500" />
              <span className="text-gray-600">
                {group.current_members}/{group.max_members} members
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign size={16} className="text-gray-500" />
              <span className="text-gray-600">
                {group.contribution_amount} XLM
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <Calendar size={16} className="text-gray-500" />
              <span className="text-gray-600">
                Round {group.current_round}/{group.total_rounds}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-gray-500" />
              <span className="text-gray-600">
                {Math.round(group.round_duration / 86400)} days
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-stellar-blue h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="pt-2">
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isActive && group.current_members < group.max_members
                  ? 'btn-primary'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isActive || group.current_members >= group.max_members}
            >
              {group.current_members >= group.max_members 
                ? 'Group Full' 
                : isActive 
                  ? 'Join Group' 
                  : 'Not Active'
              }
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Groups;
