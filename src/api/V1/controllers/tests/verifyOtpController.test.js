import request from 'supertest';
import app from '../../../../app'; // Adjust to your app's location
import User from '../../models/User.js';
import { verifyOtp } from '../../helpers/otpHelper.js';
import { generateToken } from '../../helpers/jwtHelper.js';
import { sendPasswordResetEmail } from '../../services/emailService.js'; // Mock this email service
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
    lastName: 'User'
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


  // Test 1: OTP verification for login success
  it('should verify OTP successfully for login and return a token', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(true);
    generateToken.mockReturnValue('mockToken');

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'login' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Login successful',
      token: 'mockToken'
    });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(verifyOtp).toHaveBeenCalledWith('mockUserId', '123456');
    expect(generateToken).toHaveBeenCalledWith('mockUserId');
  });

  // Test 2: OTP verification for password reset and send reset email
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
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });

  // Test 3: User not found case
  it('should return 404 if user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'nonexistent@example.com', otp: '123456', action: 'login' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'User not found' });
  });

  // Test 4: Invalid OTP case
  it('should return 400 if OTP is invalid', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: 'invalidOtp', action: 'login' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid OTP' });
  });

  // Test 5: OTP expired error
  it('should return 400 if OTP verification fails due to expiration', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockRejectedValue(new Error('OTP expired'));

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'login' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'OTP expired' });
  });

  // Test 6: Invalid action parameter
  it('should return 400 for invalid action parameter', async () => {
    User.findOne.mockResolvedValue(mockUser);
    verifyOtp.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'invalidAction' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Invalid action provided' });
  });

  // Test 7: Server error case
  it('should return 500 if a server error occurs', async () => {
    User.findOne.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'test@example.com', otp: '123456', action: 'login' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Server error' });
    expect(console.error).toHaveBeenCalled();
  });
});
