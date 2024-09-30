import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to generate the common email HTML structure
const generateEmailHtml = (header, content) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${header}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
            
            body {
                font-family: 'Poppins', Arial, sans-serif;
                background-color: #f4f7fa;
                margin: 0;
                padding: 0;
            }
            a {
              text-decoration: none;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background: linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%);
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            }
            .header {
                background: linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%);
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 28px;
                font-weight: 600;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .content {
                padding: 40px;
                text-align: left;
                color: #333333;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 20px;
            }
            .fallback-link .btn {
                display: inline-block;
                padding: 12px 24px;
                color: #ffffff;
                background: linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%);
                text-decoration: none;
                border-radius: 50px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            .fallback-link {
                display: inline-block;
                text-decoration: none;
                font-weight: 500;
                color: #1e293b;
            }
            .footer {
                text-align: center;
                padding: 20px;
                background: linear-gradient(135deg, #6e48aa 0%, #9d50bb 100%);
                color: #ffffff;
                font-size: 14px;
            }
            .footer p {
                margin: 5px 0;
            }
            .highlight {
                font-weight: 600;
                color: #6e48aa;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${header}</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; 2024 AlloMedia, Inc. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`;

// Updated send verification email function
export const sendVerificationEmail = async (userEmail, verificationLink, firstName, lastName) => {
  const content = `
    <p>Hi <span class="highlight">${firstName} ${lastName}</span>,</p>
    <p>Thank you for signing up for AlloMedia! Please verify your email address to activate your account.</p>
    <p>Click the button below to verify your email:</p>
    <a href="${verificationLink}" class="fallback-link" target="_blank"><span class="btn">Verify My Email</span></a>
    <p>If you're having trouble clicking the "Verify My Email" button, copy and paste the URL below into your web browser:</p>
    <a href="${verificationLink}" class="fallback-link">${verificationLink}</a>
    <p>If you didn't sign up for AlloMedia, you can ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Verify Your Email - AlloMedia',
    html: generateEmailHtml('Welcome to AlloMedia!', content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};

// Updated send OTP email function
export const sendOtpEmail = async (userEmail, subject, message, firstName, lastName) => {
  const content = `
    <p>Hi <span class="highlight">${firstName} ${lastName}</span>,</p>
    <p>${message}</p>
    <p>This code is valid for 5 minutes. Please enter it promptly.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: subject,
    html: generateEmailHtml('AlloMedia - OTP Request', content), 
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Updated send password reset email function
export const sendPasswordResetEmail = async (userEmail, resetUrl, firstName, lastName) => {
  const content = `
    <p>Hi <span class="highlight">${firstName} ${lastName}</span>,</p>
    <p>You have requested to reset your password for your AlloMedia account.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" class="fallback-link" target="_blank"><span class="btn">Reset My Password</span></a>
    <p>If you're having trouble clicking the "Reset My Password" button, copy and paste the URL below into your web browser:</p>
    <a href="${resetUrl}" class="fallback-link">${resetUrl}</a>
    <p>If you didn't request a password reset, you can ignore this email.</p>
    <p>This link will expire in 1 hour for security reasons.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Reset Request - AlloMedia',
    html: generateEmailHtml('Reset Your Password', content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Updated send password reset confirmation email function
export const sendPasswordResetConfirmationEmail = async (userEmail, firstName, lastName) => {
  const content = `
    <p>Hi <span class="highlight">${firstName} ${lastName}</span>,</p>
    <p>Your password has been successfully reset.</p>
    <p>If you did not perform this action, please contact our support team immediately.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Reset Confirmation - AlloMedia',
    html: generateEmailHtml('Password Reset Successful', content),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent');
  } catch (error) {
    console.error('Error sending password reset confirmation email:', error);
    throw error;
  }
};