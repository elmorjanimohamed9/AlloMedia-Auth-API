import request from 'supertest';
import app from '../../../../app';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { sendVerificationEmail } from '../../services/emailService.js';
import { generateToken } from '../../helpers/jwtHelper.js';
import mongoose from 'mongoose';

jest.mock('../../services/emailService.js');
jest.mock('../../helpers/jwtHelper.js');

describe('POST /api/auth/register', () => {
  let validUser;
  let mockRole;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    const roleId = new mongoose.Types.ObjectId();
    validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Main St, City, Country',
      roles: [roleId]
    };
    mockRole = { _id: roleId, name: 'user' };

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(Role, 'find').mockResolvedValue([mockRole]);
    jest.spyOn(User.prototype, 'save').mockImplementation(function() {
      Object.assign(this, validUser, {
        isEmailVerified: false,
        devices: [{
          userAgent: 'test-user-agent',
          ipAddress: '127.0.0.1',
          lastLogin: new Date(),
          isVerified: false
        }]
      });
      return Promise.resolve(this);
    });
    generateToken.mockReturnValue('mockVerificationToken');
    sendVerificationEmail.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    console.log('Response status:', response.status);
    console.log('Response body:', response.body);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully. Please check your email for verification.');
    expect(response.body.verificationToken).toBe('mockVerificationToken');
    
    expect(User.prototype.save).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalled();

    // Check if the user is saved with correct data
    const savedUser = User.prototype.save.mock.instances[0];
    console.log('Saved user:', savedUser);

    // Use separate expect statements for each property
    expect(savedUser.firstName).toBe(validUser.firstName);
    expect(savedUser.lastName).toBe(validUser.lastName);
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.phone).toBe(validUser.phone);
    expect(savedUser.address).toBe(validUser.address);
    expect(savedUser.roles.length).toBe(1);
    expect(savedUser.roles[0]).toEqual(expect.any(mongoose.Types.ObjectId));
    expect(savedUser.isEmailVerified).toBe(false);
    
    expect(Array.isArray(savedUser.devices)).toBe(true);
    expect(savedUser.devices.length).toBe(1);
    
    if (savedUser.devices.length > 0) {
      const device = savedUser.devices[0];
      expect(device.userAgent).toBe('test-user-agent');
      expect(device.ipAddress).toBe('127.0.0.1');
      expect(device.lastLogin).toBeInstanceOf(Date);
      expect(device.isVerified).toBe(false);
    }
  });

  it('should return 400 if user already exists', async () => {
    jest.spyOn(User, 'findOne').mockResolvedValue({ email: validUser.email });
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User already exists');
  });

  it('should return 400 if validation fails', async () => {
    const invalidUser = { ...validUser, email: 'invalid-email' };
    const response = await request(app)
      .post('/api/auth/register')
      .send(invalidUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('email');
  });

  it('should return 400 if roles are invalid', async () => {
    jest.spyOn(Role, 'find').mockResolvedValue([]);
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('One or more roles are invalid');
  });

  it('should return 500 if server error occurs', async () => {
    jest.spyOn(User.prototype, 'save').mockRejectedValue(new Error('Database error'));
    const response = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Server error');
  });

  it('should create verification link with correct parameters', async () => {
    process.env.BASE_URL = 'http://example.com';
    
    await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const expectedLink = `http://example.com/api/auth/verify-email/mockVerificationToken?email=${encodeURIComponent(validUser.email)}`;
    expect(sendVerificationEmail).toHaveBeenCalledWith(validUser.email, expectedLink, validUser.firstName, validUser.lastName);
  });
});