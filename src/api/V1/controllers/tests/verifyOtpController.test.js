import request from 'supertest';
import express from 'express';
import { verifyOtpHandler } from '../auth/verifyOtpController.js';
import User from '../../models/User.js';
import { verifyOtp } from '../../helpers/otpHelper.js';
import { generateAccessToken } from '../../services/tokenService.js';

jest.mock('../../models/User.js');
jest.mock('../../helpers/otpHelper.js');
jest.mock('../../services/tokenService.js');

// Create a new express app for testing
const app = express();
app.use(express.json());

// Mock middleware to set userId
const mockAuthMiddleware = (req, res, next) => {
  req.userId = 'user-id';
  next();
};

// Apply mock middleware and route
app.post('/api/auth/verify-otp', mockAuthMiddleware, verifyOtpHandler);

describe('POST /api/auth/verify-otp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should verify OTP successfully', async () => {
    verifyOtp.mockResolvedValue(true);
    User.findById.mockResolvedValue({
      _id: 'user-id',
      email: 'test@example.com',
    });
    User.findByIdAndUpdate.mockResolvedValue({});
    generateAccessToken.mockReturnValue('new-access-token');

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ otp: '123456' })
      .set('user-agent', 'test-agent')
      .set('x-forwarded-for', '127.0.0.1');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OTP verified successfully');
    expect(response.body).toHaveProperty('accessToken', 'new-access-token');
  });

  it('should return 400 if OTP is invalid', async () => {
    verifyOtp.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ otp: '123456' })
      .set('user-agent', 'test-agent')
      .set('x-forwarded-for', '127.0.0.1');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid or expired OTP');
  });

  it('should return 404 if user is not found', async () => {
    verifyOtp.mockResolvedValue(true);
    User.findById.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ otp: '123456' })
      .set('user-agent', 'test-agent')
      .set('x-forwarded-for', '127.0.0.1');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('should return 500 if there is a server error', async () => {
    verifyOtp.mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ otp: '123456' })
      .set('user-agent', 'test-agent')
      .set('x-forwarded-for', '127.0.0.1');

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Error verifying OTP');
  });
});