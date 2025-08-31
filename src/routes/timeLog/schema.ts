import Joi from 'joi';

export default {
  getDailyTimeLogs: Joi.object().keys({
    startDate: Joi.date().iso().required().messages({
      'any.required': 'Start date is required',
      'date.format': 'Start date must be a valid ISO date',
    }),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
      'any.required': 'End date is required',
      'date.format': 'End date must be a valid ISO date',
      'date.min': 'End date must be after start date',
    }),
    page: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).optional().messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
    userId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'User ID must be a valid MongoDB ObjectId',
      }),
  }),
};
