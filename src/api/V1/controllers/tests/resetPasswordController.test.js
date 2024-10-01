import { resetPasswordController } from '../../controllers/auth/resetPasswordController.js';
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetConfirmationEmail } from '../../services/emailService.js';

// Mocking dependencies
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('../../helpers/jwtHelper');
jest.mock('../../services/emailService');

describe('resetPasswordController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        token: 'valid-token',
        newPassword: 'newPassword123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reset password successfully', async () => {
    const mockUser = { _id: 'user-id', email: 'user@example.com', firstName: 'John', lastName: 'Doe' };
    verifyToken.mockReturnValue({ id: 'user-id' });
    User.findById.mockResolvedValue(mockUser);
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed-password');
    User.updateOne.mockResolvedValue({});

    await resetPasswordController(req, res);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(User.findById).toHaveBeenCalledWith('user-id');
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'salt');
    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user-id' },
      { $set: { password: 'hashed-password' } },
      { runValidators: false }
    );
    expect(sendPasswordResetConfirmationEmail).toHaveBeenCalledWith('user@example.com', 'John', 'Doe');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password has been reset successfully' });
  });

  it('should return 400 if token is invalid', async () => {
    verifyToken.mockReturnValue(null);

    await resetPasswordController(req, res);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password reset token is invalid or has expired' });
  });

  it('should return 400 if user is not found', async () => {
    verifyToken.mockReturnValue({ id: 'user-id' });
    User.findById.mockResolvedValue(null);

    await resetPasswordController(req, res);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(User.findById).toHaveBeenCalledWith('user-id');
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 if server error occurs', async () => {
    verifyToken.mockReturnValue({ id: 'user-id' });
    User.findById.mockRejectedValue(new Error('Database error'));

    console.error = jest.fn(); 

    await resetPasswordController(req, res);

    expect(verifyToken).toHaveBeenCalledWith('valid-token');
    expect(User.findById).toHaveBeenCalledWith('user-id');
    expect(console.error).toHaveBeenCalledWith('Reset password error:', expect.any(Error));
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error. Please try again later.' });
  });
});