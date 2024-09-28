import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5000,               
  mongoURI: process.env.MONGO_URI,              
  jwtSecret: process.env.JWT_SECRET,            
  otpExpirationTime: process.env.OTP_EXPIRATION_TIME || '5m', 
  smtpHost: process.env.SMTP_HOST,              
  smtpPort: process.env.SMTP_PORT,              
  smtpUser: process.env.SMTP_USER,              
  smtpPass: process.env.SMTP_PASS,              
};

export default config;
