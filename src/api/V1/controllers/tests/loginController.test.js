import request from 'supertest';
import app from '../../../../app'; // Adjust the path to your app entry point
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '../../services/tokenService.js';
import { sendOtp } from '../../services/otpService.js';

jest.mock('../../models/User.js');
jest.mock('bcryptjs');
jest.mock('../../services/tokenService.js');
jest.mock('../../services/otpService.js');

describe('Login Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: 'test@example.com',
        password: 'Password123!',
      },
      headers: {
        'user-agent': 'test-agent',
      },
      ip: '127.0.0.1',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      isEmailVerified: true,
      devices: [
        {
          userAgent: 'test-agent',
          ipAddress: '::ffff:127.0.0.1', 
          isVerified: true,
        },
      ],
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    generateAccessToken.mockReturnValue('access-token');

    const response = await request(app)
      .post('/api/auth/login')
      .send(req.body);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.message).toBe('OTP sent to your email. Please verify your device.');
  });

  it('should return 400 if email is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/api/auth/login')
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if password is incorrect', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      isEmailVerified: true,
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Invalid credentials');
  });

  it('should return 400 if email is not verified', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      isEmailVerified: false,
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send(req.body);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email not verified. Please check your email to verify your account.');
  });

  it('should send OTP if device is not verified', async () => {
    const mockUser = {
      _id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
      isEmailVerified: true,
      devices: [],
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    sendOtp.mockResolvedValue();

    const response = await request(app)
      .post('/api/auth/login')
      .send(req.body);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OTP sent to your email. Please verify your device.');
    expect(response.body).toHaveProperty('requireOtp', true);
  });
});