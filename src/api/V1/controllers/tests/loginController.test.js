import request from 'supertest';
import app from '../../../../app';
import User from '../../models/User.js'; 
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import * as otpService from '../../services/otpService.js'; 
import * as otpHelper from '../../helpers/otpHelper.js';

jest.mock('../../services/otpService.js');
jest.mock('../../helpers/otpHelper.js');

describe('POST /api/auth/login', () => {
  let mockUser;
  let plainPassword = 'ValidPassword123!';
  let hashedPassword;

  beforeEach(async () => {
    hashedPassword = await bcrypt.hash(plainPassword, 10);

    mockUser = {
      _id: 'userId123',
      email: 'test@example.com',
      password: hashedPassword,
      isEmailVerified: true,
      save: jest.fn(),
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true); 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should login successfully without OTP using valid email and password', async () => {
    otpService.sendOtp.mockResolvedValue(); 

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: plainPassword });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OTP sent to your email');
  });

  it('should login successfully with OTP using valid email and password', async () => {
    otpHelper.verifyOtp.mockResolvedValue(true); 

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: plainPassword, otp: '123456' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should return 400 if email is not verified', async () => {
    mockUser.isEmailVerified = false; 

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: plainPassword });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email not verified. Please check your email to verify your account.');
  });

  it('should return 400 if email is invalid', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null); 

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'invalid@example.com', password: plainPassword });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if password is invalid', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false); 

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if OTP is invalid', async () => {
    otpHelper.verifyOtp.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: plainPassword, otp: '654321' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid or expired OTP');
  });

  it('should return 500 if a server error occurs', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(User, 'findOne').mockImplementation(() => {
      throw new Error('Mocked DB error');
    });
  
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
  
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error. Please try again later.');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
  
    consoleErrorSpy.mockRestore();
  });
});
