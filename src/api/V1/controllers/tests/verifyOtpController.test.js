import request from 'supertest';
import app from '../../../../app'; 
import User from '../../models/User.js';
import { verifyOtp } from '../../helpers/otpHelper.js';
import { generateToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';
import mongoose from 'mongoose';

jest.mock('../../models/User.js');
jest.mock('../../helpers/otpHelper.js');
jest.mock('../../helpers/jwtHelper.js');
jest.mock('../../services/emailService.js');

describe('POST /api/auth/verify-otp', () => {
  const mockUser = {
    _id: 'mockUserId',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    devices: [],
    save: jest.fn().mockResolvedValue(true)
  };

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Test 1: OTP verification for changeDevice success (new device)
  it('should verify OTP successfully for changeDevice and add new device', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({ email: 'test@example.com', otp: '123456', action: 'changeDevice' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Device verified successfully' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(verifyOtp).toHaveBeenCalledWith('mockUserId', '123456');
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.devices).toContainEqual({
      userAgent: 'test-agent',
      ipAddress: '::ffff:127.0.0.1',
      isVerified: true,
      lastLogin: expect.any(Date)
    });
  });

  // Test 2: OTP verification for changeDevice (already verified device)
  it('should return already verified message for changeDevice with existing device', async () => {
    const userWithVerifiedDevice = {
      ...mockUser,
      devices: [{ userAgent: 'test-agent', ipAddress: '::ffff:127.0.0.1', isVerified: true }]
    };
    User.findOne.mockResolvedValue(userWithVerifiedDevice);
    verifyOtp.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .set('User-Agent', 'test-agent')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({ email: 'test@example.com', otp: '123456', action: 'changeDevice' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Device already verified' });
  });

  // Test 3: OTP verification for password reset and send reset email
  it('should verify OTP for password reset and send reset email', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(true);
    generateToken.mockReturnValue('mockResetToken');
    sendPasswordResetEmail.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'resetPassword' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'OTP verified. Password reset email sent' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(verifyOtp).toHaveBeenCalledWith('mockUserId', '123456');
    expect(generateToken).toHaveBeenCalledWith('mockUserId');
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.stringContaining('/reset-password/mockResetToken'),
      'Test',
      'User'
    );
  });

  // Test 4: User not found case
  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'nonexistent@example.com', otp: '123456', action: 'changeDevice' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  // Test 5: Invalid OTP case
  it('should return 400 if OTP is invalid', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: 'invalidOtp', action: 'changeDevice' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid OTP' });
  });

  // Test 6: OTP expired error
  it('should return 400 if OTP verification fails due to expiration', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockRejectedValue(new Error('OTP expired'));

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'changeDevice' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'OTP expired' });
  });

  // Test 7: Invalid action parameter
  it('should return 400 for invalid action parameter', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'invalidAction' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid action provided' });
  });

  // Test 8: Server error case
  it('should return 500 if a server error occurs', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'changeDevice' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Server error' });
    expect(console.error).toHaveBeenCalled();
  });
});