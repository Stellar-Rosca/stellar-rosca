const express = require('express');
const sorobanService = require('../services/sorobanService');
const logger = require('../utils/logger');

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await sorobanService.getAllGroups();

    res.json({
      success: true,
      data: {
        groups,
        count: groups.length
      }
    });
  } catch (error) {
    logger.error('Failed to get groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve groups'
    });
  }
});

// Get specific group
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await sorobanService.getGroup(groupId);

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    logger.error(`Failed to get group ${req.params.groupId}:`, error);
    res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }
});

// Get group statistics
router.get('/:groupId/stats', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await sorobanService.getGroup(groupId);
    
    // Calculate additional statistics
    const stats = {
      ...group,
      totalPool: group.contributionAmount * group.currentMembers,
      currentRoundProgress: 'N/A', // Would need additional contract data
      nextPayoutAmount: group.contributionAmount * group.currentMembers,
      isActive: group.is_active,
      completionPercentage: Math.round((group.current_round / group.total_rounds) * 100)
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Failed to get group stats ${req.params.groupId}:`, error);
    res.status(404).json({
      success: false,
      error: 'Group not found'
    });
  }
});

// Get group events
router.get('/:groupId/events', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50 } = req.query;
    
    const allEvents = await sorobanService.getContractEvents(null, parseInt(limit));
    
    // Filter events for this specific group
    const groupEvents = allEvents.filter(event => {
      // This would need to be adjusted based on actual event structure
      return event.body && event.body.value && 
             event.body.value.toString().includes(groupId);
    });

    res.json({
      success: true,
      data: {
        events: groupEvents,
        count: groupEvents.length
      }
    });
  } catch (error) {
    logger.error(`Failed to get group events ${req.params.groupId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve group events'
    });
  }
});

module.exports = router;
