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
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          padding: 20px;
          background-color: #ffffff;
          max-width: 600px;
          margin: 20px auto;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #4CAF50;
          padding: 10px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .header h1 {
          color: #ffffff;
          margin: 0;
        }
        .content {
          padding: 20px;
          text-align: left;
          color: #333333;
        }
        .content a {
          display: inline-block;
          padding: 12px 20px;
          color: #ffffff;
          background-color: #4CAF50;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #ffffff;
          background-color: #4CAF50;
          border-radius: 0 0 8px 8px;
          font-size: 12px;
        }
        .footer p {
          margin: 5px 0;
        }
        .bold {
          font-weight: bold;
          color: #4CAF50;
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
          <p>1234 Media Street, Suite 100, Media City</p>
        </div>
      </div>
    </body>
    </html>
`;

// Send verification email function
export const sendVerificationEmail = async (userEmail, verificationLink, firstName, lastName) => {
  const content = `
    <p>Hi <span class="bold">${firstName} ${lastName}</span>,</p>
    <p>Thank you for signing up for AlloMedia! Please verify your email address to activate your account.</p>
    <p>Click the button below to verify your email:</p>
    <a href="${verificationLink}" target="_blank">Verify My Email</a>
    <p>If you didn’t sign up for AlloMedia, you can ignore this email.</p>
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

// Send OTP email function
export const sendOtpEmail = async (userEmail, subject, message, firstName, lastName) => {
  // Construct the email content
  const content = `
    <p>Hi <span class="bold">${firstName} ${lastName}</span>,</p>
    <p>${message}</p>
    <p>This code is valid for 5 minutes. Please enter it promptly.</p>
    <p>If you didn't request this code, please ignore this email.</p>
  `;

  // Mail options
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

// send password reset
export const sendPasswordResetEmail = async (userEmail, resetUrl, firstName, lastName) => {
  const content = `
    <p>Hi <span class="bold">${firstName} ${lastName}</span>,</p>
    <p>You have requested to reset your password for your AlloMedia account.</p>
    <p>Click the button below to reset your password:</p>
    <a href="${resetUrl}" target="_blank">Reset My Password</a>
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

// send password reset confirmation email
export const sendPasswordResetConfirmationEmail = async (userEmail, firstName, lastName) => {
  const content = `
    <p>Hi <span class="bold">${firstName} ${lastName}</span>,</p>
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
