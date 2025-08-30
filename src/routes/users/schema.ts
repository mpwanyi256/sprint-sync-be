import Joi from 'joi';

export default {
    getUsers: Joi.object().keys({
        page: Joi.number().required(),
        limit: Joi.number().required(),
        search: Joi.string().optional(),
        isAdmin: Joi.string().valid('true', 'false').optional(),
    }),
};
