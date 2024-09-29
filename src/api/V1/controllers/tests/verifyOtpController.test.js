import request from 'supertest';
import app from '../../../../app';
import User from '../../models/User.js';
import { verifyOtp } from '../../helpers/otpHelper.js';
import { generateToken } from '../../helpers/jwtHelper.js';
import mongoose from 'mongoose';

jest.mock('../../models/User.js');
jest.mock('../../helpers/otpHelper.js');
jest.mock('../../helpers/jwtHelper.js');

describe('POST /api/auth/verify-otp', () => {
  const mockUser = {
    _id: 'mockUserId',
    email: 'test@example.com'
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should verify OTP successfully and return a token', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(true);
    generateToken.mockReturnValue('mockToken');

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'OTP verified, login successful',
      token: 'mockToken'
    });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(verifyOtp).toHaveBeenCalledWith('mockUserId', '123456');
    expect(generateToken).toHaveBeenCalledWith('mockUserId');
  });

  it('should return 400 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'nonexistent@example.com', otp: '123456' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  it('should return 400 if OTP is invalid', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid OTP' });
  });

  it('should return 400 if OTP verification fails with an error', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockRejectedValue(new Error('OTP expired'));

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'OTP expired' });
  });

  it('should return 500 if server error occurs', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Server error' });
  });
});