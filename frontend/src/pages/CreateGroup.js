import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from 'react-query';
import { useWallet } from '../contexts/WalletContext';
import { contractAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateGroup = () => {
  const { publicKey, signTransaction } = useWallet();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const watchedValues = watch();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const groupData = {
        admin: publicKey,
        ...data,
      };

      const response = await contractAPI.createGroup(groupData);
      
      // If the contract returns a transaction that needs signing
      if (response.data?.transactionXDR) {
        const signedTx = await signTransaction(response.data.transactionXDR);
        // Submit the signed transaction to the backend
        // await contractAPI.submitTransaction(signedTx);
      }

      toast.success('Group created successfully!');
      queryClient.invalidateQueries('allGroups');
      queryClient.invalidateQueries('userGroups');
      
      // Redirect to groups page
      window.location.href = '/groups';
    } catch (error) {
      console.error('Failed to create group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Group</h1>
        <p className="text-gray-600 mt-2">Set up a new ROSCA savings group</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                {...register('name', { 
                  required: 'Group name is required',
                  maxLength: { value: 50, message: 'Name must be less than 50 characters' }
                })}
                className="input-field"
                placeholder="e.g., Monthly Savings Club"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Description is required',
                  maxLength: { value: 200, message: 'Description must be less than 200 characters' }
                })}
                className="input-field"
                rows={3}
                placeholder="Describe the purpose and rules of your ROSCA group"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribution Amount (XLM) *
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  min="0.0000001"
                  {...register('contributionAmount', { 
                    required: 'Contribution amount is required',
                    min: { value: 0.0000001, message: 'Amount must be greater than 0' }
                  })}
                  className="input-field"
                  placeholder="10.0"
                />
                {errors.contributionAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.contributionAmount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Members *
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  {...register('maxMembers', { 
                    required: 'Maximum members is required',
                    min: { value: 2, message: 'Minimum 2 members required' },
                    max: { value: 20, message: 'Maximum 20 members allowed' }
                  })}
                  className="input-field"
                  placeholder="5"
                />
                {errors.maxMembers && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxMembers.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Round Duration (seconds) *
                </label>
                <input
                  type="number"
                  min="3600"
                  {...register('roundDuration', { 
                    required: 'Round duration is required',
                    min: { value: 3600, message: 'Minimum 1 hour duration' }
                  })}
                  className="input-field"
                  placeholder="604800 (7 days)"
                />
                {errors.roundDuration && (
                  <p className="text-red-500 text-sm mt-1">{errors.roundDuration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Rounds *
                </label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  {...register('totalRounds', { 
                    required: 'Total rounds is required',
                    min: { value: 1, message: 'Minimum 1 round required' },
                    max: { value: 52, message: 'Maximum 52 rounds allowed' }
                  })}
                  className="input-field"
                  placeholder="12"
                />
                {errors.totalRounds && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalRounds.message}</p>
                )}
              </div>
            </div>

            {/* Preview */}
            {watchedValues.name && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Group Preview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{watchedValues.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Contribution:</span>
                    <p className="font-medium">{watchedValues.contributionAmount || 0} XLM</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Members:</span>
                    <p className="font-medium">1/{watchedValues.maxMembers || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <p className="font-medium">{Math.round((watchedValues.roundDuration || 0) / 86400)} days</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Rounds:</span>
                    <p className="font-medium">{watchedValues.totalRounds || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Pool:</span>
                    <p className="font-medium">
                      {(watchedValues.contributionAmount || 0) * (watchedValues.maxMembers || 0)} XLM
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span>Creating Group...</span>
                  </>
                ) : (
                  <span>Create Group</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroup;
