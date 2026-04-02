const express = require('express');
const sorobanService = require('../services/sorobanService');
const logger = require('../utils/logger');

const router = express.Router();

// Get member contributions
router.get('/:memberId/contributions', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        error: 'Group ID is required'
      });
    }

    const contributions = await sorobanService.getMemberContributions(groupId, memberId);

    res.json({
      success: true,
      data: contributions
    });
  } catch (error) {
    logger.error(`Failed to get member contributions ${req.params.memberId}:`, error);
    res.status(404).json({
      success: false,
      error: 'Member contributions not found'
    });
  }
});

// Get member statistics
router.get('/:memberId/stats', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        error: 'Group ID is required'
      });
    }

    const contributions = await sorobanService.getMemberContributions(groupId, memberId);
    const group = await sorobanService.getGroup(groupId);
    
    const stats = {
      memberId,
      groupId,
      totalContributed: contributions.total_contributed,
      roundsPaid: contributions.rounds_paid.length,
      roundsMissed: contributions.rounds_missed.length,
      contributionRate: Math.round((contributions.rounds_paid.length / group.current_round) * 100),
      totalRounds: group.total_rounds,
      currentRound: group.current_round,
      remainingContributions: group.total_rounds - contributions.rounds_paid.length,
      expectedTotalContribution: group.contribution_amount * group.total_rounds,
      actualTotalContribution: contributions.total_contributed
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Failed to get member stats ${req.params.memberId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve member statistics'
    });
  }
});

// Get member's groups
router.get('/:memberId/groups', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Get all groups and filter ones where member is a participant
    const allGroups = await sorobanService.getAllGroups();
    const memberGroups = [];
    
    for (const groupId of allGroups) {
      try {
        const group = await sorobanService.getGroup(groupId);
        if (group.members && group.members.includes(memberId)) {
          memberGroups.push(group);
        }
      } catch (error) {
        // Skip groups that can't be loaded
        continue;
      }
    }

    res.json({
      success: true,
      data: {
        groups: memberGroups,
        count: memberGroups.length
      }
    });
  } catch (error) {
    logger.error(`Failed to get member groups ${req.params.memberId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve member groups'
    });
  }
});

// Get member's payout history
router.get('/:memberId/payouts', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { groupId } = req.query;
    
    if (!groupId) {
      return res.status(400).json({
        success: false,
        error: 'Group ID is required'
      });
    }

    // This would need to be implemented in the contract
    // For now, return a placeholder
    const payouts = [];

    res.json({
      success: true,
      data: {
        payouts,
        count: payouts.length
      }
    });
  } catch (error) {
    logger.error(`Failed to get member payouts ${req.params.memberId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve member payout history'
    });
  }
});

module.exports = router;
