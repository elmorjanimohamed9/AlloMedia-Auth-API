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
    validUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'ValidPassword123!',
      phone: '1234567890',
      address: '123 Main St, City, Country',
      roles: ['validRoleId']
    };

    mockRole = {
      _id: 'validRoleId',
      name: 'user'
    };

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(Role, 'find').mockResolvedValue([mockRole]);
    jest.spyOn(User.prototype, 'save').mockResolvedValue(validUser);
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

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully. Please check your email for verification.');
    expect(response.body.verificationToken).toBe('mockVerificationToken');
    expect(User.prototype.save).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalled();
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
});