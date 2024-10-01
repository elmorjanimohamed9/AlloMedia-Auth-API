import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../../app';
import User from '../../models/User.js';
import { generateToken } from '../../helpers/jwtHelper.js'; 
import { verifyToken } from '../../helpers/jwtHelper.js';

jest.mock('../../helpers/jwtHelper.js'); 

describe('GET /api/auth/verify-email/:token', () => {
    
    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close(); 
    });

    it('should verify the user email successfully', async () => {
        const uniqueEmail = `john.doe.${Date.now()}@example.com`;
        const userData = {
            firstName: 'John',
            lastName: 'Doe',
            email: uniqueEmail,
            password: 'Password123!',
            phone: '0123456789',
            address: '123 Main St',
        };

        const user = await User.create(userData);
        const token = generateToken(user._id);

        // Mock the verifyToken function to return the user ID
        verifyToken.mockReturnValue({ id: user._id });

        const response = await request(app).get(`/api/auth/verify-email/${token}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Email verified successfully. You can now log in.');
    });

    it('should return 400 if token is invalid or expired', async () => {
        const invalidToken = 'invalid-token';
        verifyToken.mockReturnValue(null); 

        const response = await request(app).get(`/api/auth/verify-email/${invalidToken}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 400 if user is not found', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const token = generateToken(nonExistentUserId);
        
        verifyToken.mockReturnValue({ id: nonExistentUserId }); 

        const response = await request(app).get(`/api/auth/verify-email/${token}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User not found');
    });

    it('should return 400 if the user is already verified', async () => {
        const uniqueEmail = `jane.doe.${Date.now()}@example.com`;
        const userData = {
            firstName: 'Jane',
            lastName: 'Doe',
            email: uniqueEmail,
            password: 'Password123!',
            phone: '0123456789',
            address: '456 Main St',
            isEmailVerified: true, 
        };

        const user = await User.create(userData);
        const token = generateToken(user._id);

        verifyToken.mockReturnValue({ id: user._id });

        const response = await request(app).get(`/api/auth/verify-email/${token}`);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('User is already verified');
    });
});
