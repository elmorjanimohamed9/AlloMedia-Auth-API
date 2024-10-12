import request from 'supertest';
import express from 'express';
import { verifyEmail } from '../auth/verifyEmailController.js';
import User from '../../models/User.js';
import jwt from 'jsonwebtoken';

jest.mock('../../models/User.js');
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.get('/api/auth/verify-email/:token', verifyEmail);

describe('GET /api/auth/verify-email/:token', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should verify email successfully', async () => {
        const mockUser = { _id: 'user-id', isEmailVerified: false };
        jwt.verify.mockReturnValue({ userId: 'user-id' });
        User.findById.mockResolvedValue(mockUser);
        User.updateOne.mockResolvedValue({});

        const response = await request(app).get('/api/auth/verify-email/valid-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ verified: true, message: 'Email verified successfully' });
        expect(User.updateOne).toHaveBeenCalledWith({ _id: 'user-id' }, { isEmailVerified: true });
    });

    it('should return 400 if token is invalid', async () => {
        jwt.verify.mockImplementation(() => {
            throw new jwt.JsonWebTokenError('Invalid token');
        });

        const response = await request(app).get('/api/auth/verify-email/invalid-token');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ verified: false, message: 'Invalid or expired token' });
    });

    it('should return 404 if user is not found', async () => {
        jwt.verify.mockReturnValue({ userId: 'non-existent-user-id' });
        User.findById.mockResolvedValue(null);

        const response = await request(app).get('/api/auth/verify-email/valid-token');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ verified: false, message: 'User not found' });
    });

    it('should return 200 if email is already verified', async () => {
        const mockUser = { _id: 'user-id', isEmailVerified: true };
        jwt.verify.mockReturnValue({ userId: 'user-id' });
        User.findById.mockResolvedValue(mockUser);

        const response = await request(app).get('/api/auth/verify-email/valid-token');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ verified: true, message: 'Email already verified' });
        expect(User.updateOne).not.toHaveBeenCalled();
    });

    it('should return 500 if server error occurs', async () => {
        jwt.verify.mockReturnValue({ userId: 'user-id' });
        User.findById.mockRejectedValue(new Error('Database error'));

        const response = await request(app).get('/api/auth/verify-email/valid-token');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            verified: false,
            message: 'Server error',
            error: 'Database error'
        });
    });
});