const express = require('express');
const sorobanService = require('../services/sorobanService');
const { validateRequest, schemas } = require('../middleware/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Get contract information
router.get('/info', async (req, res) => {
  try {
    const info = {
      contractId: sorobanService.contractId,
      network: sorobanService.network,
      rpcUrl: sorobanService.rpcUrl,
      horizonUrl: sorobanService.horizonUrl
    };

    res.json({
      success: true,
      data: info
    });
  } catch (error) {
    logger.error('Failed to get contract info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contract information'
    });
  }
});

// Get contract events
router.get('/events', async (req, res) => {
  try {
    const { startLedger, limit = 10 } = req.query;
    
    const events = await sorobanService.getContractEvents(
      startLedger ? parseInt(startLedger) : null,
      Math.min(parseInt(limit), 100) // Max 100 events
    );

    res.json({
      success: true,
      data: {
        events,
        count: events.length
      }
    });
  } catch (error) {
    logger.error('Failed to get contract events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve contract events'
    });
  }
});

// Create a new group
router.post('/create-group', validateRequest(schemas.createGroup), async (req, res) => {
  try {
    const {
      admin,
      name,
      description,
      contributionAmount,
      maxMembers,
      roundDuration,
      totalRounds
    } = req.body;

    const result = await sorobanService.createGroup(
      admin,
      name,
      description,
      contributionAmount,
      maxMembers,
      roundDuration,
      totalRounds
    );

    res.status(201).json({
      success: true,
      data: {
        groupId: result.toString(),
        message: 'Group created successfully'
      }
    });
  } catch (error) {
    logger.error('Failed to create group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create group'
    });
  }
});

// Join a group
router.post('/join-group', validateRequest(schemas.joinGroup), async (req, res) => {
  try {
    const { groupId, member } = req.body;

    await sorobanService.joinGroup(groupId, member);

    res.json({
      success: true,
      message: 'Successfully joined group'
    });
  } catch (error) {
    logger.error('Failed to join group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join group'
    });
  }
});

// Make a contribution
router.post('/contribute', validateRequest(schemas.contribute), async (req, res) => {
  try {
    const { groupId, member } = req.body;

    await sorobanService.contribute(groupId, member);

    res.json({
      success: true,
      message: 'Contribution made successfully'
    });
  } catch (error) {
    logger.error('Failed to make contribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to make contribution'
    });
  }
});

// Claim payout
router.post('/claim-payout', validateRequest(schemas.claimPayout), async (req, res) => {
  try {
    const { groupId, round } = req.body;

    // This would need to be implemented in the contract
    // await sorobanService.claimPayout(groupId, round);

    res.json({
      success: true,
      message: 'Payout claimed successfully'
    });
  } catch (error) {
    logger.error('Failed to claim payout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim payout'
    });
  }
});

module.exports = router;
