import Joi from 'joi';

// Validation schema for Role
const roleValidationSchema = Joi.object({
  name: Joi.string()
    .valid('Admin', 'Client', 'deliverer') 
    .required()
    .messages({
      'any.only': 'Role name must be one of the following: Admin, Client, Livreur',
      'string.base': 'Role name must be a string',
      'string.empty': 'Role name is required',
    }),
});

export { roleValidationSchema };
