import Joi from 'joi';
import { JoiObjectId } from '../../helpers/validator';

export default {
  createUsers: Joi.object().keys({
    users: Joi.array()
      .items(
        Joi.object().keys({
          firstName: Joi.string().required().min(1).max(50),
          lastName: Joi.string().required().min(1).max(50),
          email: Joi.string().required().email(),
          password: Joi.string().required().min(6),
          isAdmin: Joi.boolean().default(false),
        })
      )
      .min(1)
      .max(50)
      .required(),
  }),

  createTasks: Joi.object().keys({
    tasks: Joi.array()
      .items(
        Joi.object().keys({
          title: Joi.string().required().min(1).max(200),
          description: Joi.string().required().min(1).max(2000),
          totalMinutes: Joi.number().required().min(1),
          status: Joi.string()
            .valid('TODO', 'IN_PROGRESS', 'DONE')
            .default('TODO'),
        })
      )
      .min(1)
      .max(100)
      .required(),
  }),

  updateUserRole: Joi.object().keys({
    isAdmin: Joi.boolean().required(),
  }),

  updateUserRoleParams: Joi.object().keys({
    userId: JoiObjectId().required(),
  }),
};
