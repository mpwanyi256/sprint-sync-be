import Joi from 'joi';

export default {
    createTask: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        totalMinutes: Joi.number().required(),
    }),
};
