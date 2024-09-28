import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../../app'; // Adjust the path as necessary
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import { sendOtp } from '../../services/otpService.js';
import { verifyOtp } from '../../helpers/otpHelper.js';

// Mock external services and helpers
jest.mock('../../services/otpService.js');
jest.mock('../../helpers/otpHelper.js');

describe('POST /api/auth/login', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it('should login successfully without OTP', async () => {
        const uniqueEmail = `john.doe.${Date.now()}@example.com`;
        const password = 'Password123!'; // Valid password format
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userData = {
            email: uniqueEmail,
            password: hashedPassword,
            address: '123 Main St', // Add address
            phone: '1234567890',    // Add phone
            lastName: 'Doe',        // Add last name
            firstName: 'John',      // Add first name
        };

        await User.create(userData);

        const response = await request(app).post('/api/auth/login').send({ email: uniqueEmail, password });
        
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('OTP sent to your email');
        expect(sendOtp).toHaveBeenCalledWith(uniqueEmail); // Check if OTP was sent
    });

    it('should login successfully with OTP', async () => {
        const uniqueEmail = `jane.doe.${Date.now()}@example.com`;
        const password = 'Password123!'; // Valid password format
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userData = {
            email: uniqueEmail,
            password: hashedPassword,
            address: '456 Main St', // Add address
            phone: '0987654321',    // Add phone
            lastName: 'Doe',        // Add last name
            firstName: 'Jane',      // Add first name
        };

        const user = await User.create(userData);
        const otp = '123456'; // Mock OTP for testing
        verifyOtp.mockReturnValue(true); // Mock OTP verification to return true

        const response = await request(app).post('/api/auth/login').send({ email: uniqueEmail, password, otp });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token'); // Check if token is returned
        expect(response.body.user.email).toBe(uniqueEmail); // Check if user data is returned
    });

    it('should return 400 if email is invalid', async () => {
        const response = await request(app).post('/api/auth/login').send({ email: 'invalid@example.com', password: 'Password123!' });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 if password is invalid', async () => {
        const uniqueEmail = `test.user.${Date.now()}@example.com`;
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userData = {
            email: uniqueEmail,
            password: hashedPassword,
            address: '789 Main St', // Add address
            phone: '1122334455',     // Add phone
            lastName: 'User',        // Add last name
            firstName: 'Test',       // Add first name
        };

        await User.create(userData);

        const response = await request(app).post('/api/auth/login').send({ email: uniqueEmail, password: 'wrongPassword' });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 if OTP is invalid or expired', async () => {
        const uniqueEmail = `test.otp.${Date.now()}@example.com`;
        const password = 'Password123!';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userData = {
            email: uniqueEmail,
            password: hashedPassword,
            address: '321 Main St', // Add address
            phone: '9876543210',    // Add phone
            lastName: 'Otp',        // Add last name
            firstName: 'Test',      // Add first name
        };

        await User.create(userData);

        const response = await request(app).post('/api/auth/login').send({ email: uniqueEmail, password, otp: 'invalidOtp' });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid or expired OTP');
    });
});
