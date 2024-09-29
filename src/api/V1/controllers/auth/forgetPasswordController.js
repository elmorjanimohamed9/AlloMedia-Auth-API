import User from '../../models/User.js';
import { generateToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Générer un token JWT avec une expiration d'une heure
    const resetToken = generateToken(user._id);

    // Créer le lien de réinitialisation contenant le JWT
    const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;

    // Envoyer l'e-mail de réinitialisation avec le lien
    await sendPasswordResetEmail(user.email, resetUrl, user.firstName, user.lastName);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};
