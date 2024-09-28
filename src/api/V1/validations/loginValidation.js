import Joi from 'joi';

// Schéma de validation pour la connexion d'un utilisateur
const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Veuillez fournir un email valide',
    'string.empty': 'L\'email est requis',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit comporter au moins 8 caractères',
    'string.empty': 'Le mot de passe est requis',
  })
});

export { loginValidation };
