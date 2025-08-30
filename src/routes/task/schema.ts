import Joi from 'joi';

export default {
    createTask: Joi.object().keys({
        title: Joi.string().required(),
        description: Joi.string().required(),
        totalMinutes: Joi.number().required(),
    }),
    getTasks: Joi.object().keys({
        page: Joi.number().required(),
        limit: Joi.number().required(),
        status: Joi.string().optional(),
        assignee: Joi.string().optional(),
        createdBy: Joi.string().optional(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
    }),
    updateTask: Joi.object().keys({
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        totalMinutes: Joi.number().optional(),
        status: Joi.string().optional(),
    }),
    assignTask: Joi.object().keys({
        assignedTo: Joi.string().required(),
    }),
    searchTasks: Joi.object().keys({
        keyword: Joi.string().required(),
    }),
};
