import Joi from 'joi';

// Validation schema for user registration
const registerUserValidation = Joi.object({
  firstName: Joi.string().min(2).max(30).required().messages({
    'string.base': 'First name must be a string',
    'string.empty': 'First name is required',
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name must be at most 30 characters',
  }),
  lastName: Joi.string().min(2).max(30).required().messages({
    'string.base': 'Last name must be a string',
    'string.empty': 'Last name is required',
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name must be at most 30 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email',
    'string.empty': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required().messages({
      'string.min': 'Password must be at least 8 characters',
      'string.empty': 'Password is required',
      'string.pattern.base': 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    }),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Phone number must be between 10 and 15 digits',
    'string.empty': 'Phone number is required',
  }),
  address: Joi.string().required().messages({
    'string.empty': 'Address is required',
  }),
  roles: Joi.array().items(Joi.string()).min(1).optional(),
});

export { registerUserValidation };
