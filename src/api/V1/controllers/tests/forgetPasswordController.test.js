import { forgotPasswordController } from '../auth/forgetPasswordController.js';
import User from '../../models/User.js';
import { generateAccessToken } from '../../services/tokenService.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';

// Mock dependencies
jest.mock('../../models/User.js');
jest.mock('../../services/tokenService.js');
jest.mock('../../services/emailService.js');

describe('forgotPasswordController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: 'test@example.com' } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it('should send password reset email successfully', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    User.findOne.mockResolvedValue(mockUser);
    generateAccessToken.mockReturnValue('mock-reset-token');
    process.env.FRONTEND_URL = 'http://example.com';

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Password reset email sent successfully' });
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });

  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 if there is a server error', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Error sending password reset email' });
  });
});