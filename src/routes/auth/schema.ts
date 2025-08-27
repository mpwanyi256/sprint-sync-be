import Joi from 'joi';

export default {
    login: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
    }),
    signup: Joi.object().keys({
        firstName: Joi.string().required().min(3),
        lastName: Joi.string().required().min(3),
        email: Joi.string().required().email(),
        password: Joi.string().required().min(6),
    }),
};
