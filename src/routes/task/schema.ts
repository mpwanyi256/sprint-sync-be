import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator';

export default {
  createTask: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    totalMinutes: Joi.number().required(),
    status: Joi.string().optional(),
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
  createComment: Joi.object().keys({
    message: Joi.string().required().min(1).max(5000),
  }),
  updateComment: Joi.object().keys({
    message: Joi.string().required().min(1).max(5000),
  }),
  commentParams: Joi.object().keys({
    taskId: JoiObjectId().required(),
  }),
  commentIdParams: Joi.object().keys({
    commentId: JoiObjectId().required(),
  }),
};
