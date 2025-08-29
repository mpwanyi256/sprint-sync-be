import Joi from 'joi';

export const suggestSchema = Joi.object({
  title: Joi.string().required().min(1).max(200).trim(),
});

export const validateSuggest = (data: any) => {
  return suggestSchema.validate(data);
};
