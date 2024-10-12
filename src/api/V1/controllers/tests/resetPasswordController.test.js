import { resetPasswordController } from '../auth/resetPasswordController.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { verifyToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetConfirmationEmail } from '../../services/emailService.js';
import mongoose from 'mongoose';

// Mock dependencies
jest.mock('../../models/User.js');
jest.mock('bcryptjs');
jest.mock('../../helpers/jwtHelper.js');
jest.mock('../../services/emailService.js');
jest.mock('mongoose');

jest.mock('../../models/User.js', () => {
  return {
    __esModule: true,
    default: {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn()
    }
  };
});


describe('resetPasswordController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        token: 'valid-token',
        newPassword: 'newPassword123!'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should reset password successfully', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    verifyToken.mockReturnValue({ userId: 'user-id' });
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    User.findById.mockResolvedValue(mockUser);
    bcrypt.genSalt.mockResolvedValue('salt');
    bcrypt.hash.mockResolvedValue('hashed-password');
    User.findByIdAndUpdate.mockResolvedValue({});

    await resetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-id', { password: 'hashed-password' }, { runValidators: false });
    expect(sendPasswordResetConfirmationEmail).toHaveBeenCalledWith('user@example.com', 'John', 'Doe');
  });

  it('should return 400 if token or newPassword is missing', async () => {
    req.body = {};

    await resetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token and new password are required' });
  });

  it('should return 400 if token is invalid', async () => {
    verifyToken.mockReturnValue(null);

    await resetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });

  it('should return 400 if user ID is invalid', async () => {
    verifyToken.mockReturnValue({ userId: 'invalid-id' });
    mongoose.Types.ObjectId.isValid.mockReturnValue(false);

    await resetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid user ID' });
  });

  it('should return 400 if user is not found', async () => {
    verifyToken.mockReturnValue({ userId: 'user-id' });
    mongoose.Types.ObjectId.isValid.mockReturnValue(true);
    User.findById.mockResolvedValue(null);

    await resetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 if there is a server error', async () => {
    verifyToken.mockImplementation(() => {
      throw new Error('Server error');
    });

    await resetPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error resetting password', error: 'Server error' });
  });
});