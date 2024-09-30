import { forgotPasswordController } from '../../controllers/auth/forgetPasswordController.js';
import User from '../../models/User.js';
import { sendOtp } from '../../services/otpService.js';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../services/otpService');

describe('forgotPasswordController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send OTP and return 200 status when user is found', async () => {
    User.findOne.mockResolvedValue({ email: 'test@example.com' });
    sendOtp.mockResolvedValue();

    await forgotPasswordController(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(sendOtp).toHaveBeenCalledWith('test@example.com', 'forgotPassword');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'OTP sent to your email for password reset' });
  });

  it('should return 404 status when user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    await forgotPasswordController(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(sendOtp).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should return 500 status when an error occurs', async () => {
    const error = new Error('Database error');
    User.findOne.mockRejectedValue(error);

    console.error = jest.fn(); 

    await forgotPasswordController(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(console.error).toHaveBeenCalledWith('Forgot password error:', error);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Server error. Please try again later.' });
  });
});