import Joi from 'joi';

// Schéma de validation pour le code OTP
const otpValidation = Joi.object({
  otp: Joi.string()
    .pattern(/^[0-9]{6}$/) 
    .required()
    .messages({
      'string.pattern.base': 'Le code OTP doit être un nombre à 6 chiffres',
      'string.empty': 'Le code OTP est requis',
    }),
});

export { otpValidation };
