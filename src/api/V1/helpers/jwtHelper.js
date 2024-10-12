import jwt from 'jsonwebtoken';

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};
