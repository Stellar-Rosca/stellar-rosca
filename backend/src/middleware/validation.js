const Joi = require('joi');
const logger = require('../utils/logger');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      logger.warn(`Validation error: ${message}`);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: message
      });
    }
    
    next();
  };
};

// Schemas for ROSCA operations
const schemas = {
  createGroup: Joi.object({
    admin: Joi.string().required(),
    name: Joi.string().min(1).max(50).required(),
    description: Joi.string().min(1).max(200).required(),
    contributionAmount: Joi.number().positive().required(),
    maxMembers: Joi.number().integer().min(2).max(20).required(),
    roundDuration: Joi.number().integer().positive().required(),
    totalRounds: Joi.number().integer().min(1).max(52).required()
  }),

  joinGroup: Joi.object({
    groupId: Joi.string().hex().length(64).required(),
    member: Joi.string().required()
  }),

  contribute: Joi.object({
    groupId: Joi.string().hex().length(64).required(),
    member: Joi.string().required()
  }),

  claimPayout: Joi.object({
    groupId: Joi.string().hex().length(64).required(),
    round: Joi.number().integer().positive().required()
  })
};

module.exports = {
  validateRequest,
  schemas
};
