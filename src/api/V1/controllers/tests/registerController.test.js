import request from 'supertest';
import app from '../../../../app'; 
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import { sendVerificationEmail } from '../../services/emailService.js';
import { createClient } from 'redis';

jest.mock('../../models/User.js');
jest.mock('../../models/Role.js');
jest.mock('../../services/emailService.js');
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(),
    incr: jest.fn(),
    expire: jest.fn(),
    setEx: jest.fn(),
  })),
}));

describe('Register Controller', () => {
  let redisClientMock;

  beforeAll(() => {
    redisClientMock = createClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    const role = { _id: 'roleId', name: 'Client' };
    Role.find.mockResolvedValue([role]);
    User.findOne.mockResolvedValue(null);
    User.prototype.save = jest.fn().mockResolvedValue(true);
    redisClientMock.incr.mockResolvedValue(1);
    sendVerificationEmail.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        phone: '1234567890',
        address: '123 Main St',
        roles: ['Client'],
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully. Please check your email for verification.');
    expect(User.prototype.save).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalled();
  });

  it('should return 400 if invalid roles are provided', async () => {
    Role.find.mockResolvedValue([]); 

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'Password123!',
        phone: '0987654321',
        address: '456 Elm St',
        roles: ['InvalidRole'], 
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('One or more roles are invalid');
  });

  it('should return 500 if there is a server error during registration', async () => {
    Role.find.mockRejectedValue(new Error('Database error')); 

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@example.com',
        password: 'Password123!',
        phone: '1122334455',
        address: '789 Pine St',
        roles: ['Client'],
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe('An error occurred during registration. Please try again later.');
  });

  it('should return 400 if email format is invalid', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Bob',
        lastName: 'Brown',
        email: 'invalid-email-format', 
        password: 'Password123!',
        phone: '1234567890',
        address: '123 Main St',
        roles: ['Client'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Please provide a valid email');
  });

  it('should return 400 if password is too weak', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Charlie',
        lastName: 'Davis',
        email: 'charlie.davis@example.com',
        password: 'weakpass', 
        phone: '1234567890',
        address: '123 Main St',
        roles: ['Client'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  });

  it('should return 400 if required fields are missing', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'missing.fields@example.com',
        password: 'Password123!',
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('"firstName" is required');
  });

  it('should return 400 if email is already registered', async () => {
    User.findOne.mockResolvedValue({ email: 'existing.email@example.com' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'David',
        lastName: 'Johnson',
        email: 'existing.email@example.com',
        password: 'Password123!',
        phone: '1234567890',
        address: '123 Main St',
        roles: ['Client'],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email is already registered');
  });

});