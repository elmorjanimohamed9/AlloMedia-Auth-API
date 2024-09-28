import dotenv from 'dotenv';
import request from 'supertest';
import app from '../../../../app'; 
import User from '../../models/User'; 
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

beforeAll(async () => {
    // Connect to your test database
    await mongoose.connect(process.env.TEST_DB_URI);
});

afterEach(async () => {
    // Clean up the database after each test
    await User.deleteMany({});
});

afterAll(async () => {
    // Disconnect from the database
    await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
    it('should register a user successfully', async () => {
        const userData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'Password123!',
            phone: '0123456789',
            address: '123 Media St, Media City'
        };

        const response = await request(app).post('/api/auth/register').send(userData);
        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully. Please check your email for verification.');
        expect(response.body.verificationToken).toBeDefined();
    });

    it('should return 400 if user already exists', async () => {
        const userData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: 'Password123!',
            phone: '0123456789',
            address: '123 Media St, Media City'
        };

        // First registration
        await request(app).post('/api/auth/register').send(userData);
        
        // Try to register again
        const response = await request(app).post('/api/auth/register').send(userData);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User already exists');
    });

    it('should return 400 for invalid input', async () => {
        const userData = {
            firstName: '', 
            lastName: 'Doe',
            email: 'john.doe@example.com',
            password: '123', 
            phone: '0123456789',
            address: '123 Media St, Media City'
        };
    
        const response = await request(app).post('/api/auth/register').send(userData);
        expect(response.status).toBe(400);
        expect(response.body.message).toMatch(/First name is required/); 
    });
    
});
