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

// Send verification email function
export const sendVerificationEmail = async (userEmail, verificationLink, firstName, lastName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Verify Your Email - AlloMedia',
    html: `
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
            .content p {
              font-size: 16px;
              line-height: 1.5;
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
              color: #4CAF50; /* Optional: match with the header/footer */
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AlloMedia!</h1>
            </div>
            <div class="content">
              <p>Hi <span class="bold">${firstName} ${lastName}</span>,</p>
              <p>Thank you for signing up for AlloMedia! Please verify your email address to activate your account.</p>
              <p>Click the button below to verify your email:</p>
              <a href="${verificationLink}" target="_blank">Verify My Email</a>
              <p>If you didn’t sign up for AlloMedia, you can ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AlloMedia, Inc. All rights reserved.</p>
              <p>1234 Media Street, Suite 100, Media City</p>
            </div>
          </div>
        </body>
        </html>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};


// Send OTP email function
export const sendOtpEmail = async (userEmail, otp, firstName, lastName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Your OTP Code - AlloMedia',
    html: `
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
              color: #4CAF50; /* Optional: match with the header/footer */
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AlloMedia!</h1>
            </div>
            <div class="content">
              <p>Hi <span class="bold">${firstName} ${lastName}</span>,</p>
              <p>Your OTP code for logging in is <strong>${otp}</strong>.</p>
              <p>This code is valid for 5 minutes. Please enter it promptly.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AlloMedia, Inc. All rights reserved.</p>
              <p>1234 Media Street, Suite 100, Media City</p>
            </div>
          </div>
        </body>
        </html>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent');
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};


