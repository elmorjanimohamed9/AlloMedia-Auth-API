### **AlloMedia Delivery API - Backend (JWT Authentication)**

---

#### **Table of Contents**
- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Architecture & Folder Structure](#architecture-folder-structure)
- [Environment Setup](#environment-setup)
- [Authentication Routes](#authentication-routes)
- [Database Design](#database-design)
- [Security Features](#security-features)
- [Unit Testing](#unit-testing)
- [Project Objectives](#project-objectives)
- [Jira Board](#jira-board)

---

### **Project Overview**

AlloMedia Delivery API is a backend solution designed for a home delivery application that uses JWT-based authentication and 2FA (Two-Factor Authentication). The project aims to create a secure and scalable RESTful API with MongoDB for storing user, order, and delivery data. 

This API allows managers, clients, and delivery personnel to interact with the platform with specific features, such as managing orders, handling user roles, and securing accounts with email and SMS-based OTP verification.

#### **Key Roles & Responsibilities:**
- **Manager:** Web Admin with control over user management, order assignment, and system statistics.
- **Client:** Customers can order products, track deliveries, and manage their account.
- **Delivery Personnel (Livreur):** Manage delivery statuses and track delivery history.

---

### **Technologies Used**

- 🚀 **Node.js & Express:** Backend framework for creating the REST API.
- 🛠️ **MongoDB & Mongoose:** NoSQL database for storing user and delivery information.
- 🔒 **JWT (JsonWebToken):** For authentication and session management.
- 🛡️ **2FA (Two-Factor Authentication):** OTP verification via email or SMS for secure login.
- 🔑 **Bcrypt.js:** Password hashing for secure storage.
- ⚙️ **Dotenv:** Management of environment variables.
- 🧪 **Jest/Mocha:** Unit testing frameworks to ensure robustness.
- 📧 **Nodemailer:** For sending OTP codes via email.

---

### **Architecture & Folder Structure**

```
allomedia-delivery-api/
├── src/
│   ├── config/                          # Configuration files
│   │   ├── database.js                  # MongoDB configuration
│   │   └── config.js                    # Environment variable settings
│   ├── api/V1/                          # API version 1
│   │   ├── controllers/                 # Controllers for business logic
│   │   │   ├── auth/                    # Authentication controllers (register, login)
│   │   ├── middlewares/                 # Authentication & validation middleware
│   │   ├── models/                      # Database models (User, Role)
│   │   ├── routes/                      # API routes
│   │   │   ├── authRoutes/              # Authentication-specific routes
│   ├── services/                        # Business logic separated from controllers
│   ├── tests/                           # Unit tests for controllers and routes
├── .env                                 # Environment variables
├── .gitignore                           # Files to exclude from Git
├── package.json                         # Node dependencies and scripts
└── README.md                            # Project documentation
```

---

### **Environment Setup**

To get started with the project, create a `.env` file to configure the environment variables as follows:

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/YOUR_DB
JWT_SECRET=your_jwt_secret
OTP_EXPIRATION_TIME=5m
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
BASE_URL=http://localhost:3000
JIRA_URL=https://elmorjanimohamed.atlassian.net/jira/software/projects/AAA/boards/3
```

---

### **Authentication Routes**

The following are the core routes used for authentication and registration:

| Route                        | HTTP Method | Description                                   |
|-------------------------------|-------------|-----------------------------------------------|
| `/api/auth/register`          | `POST`      | Register a new user                           |
| `/api/auth/login`             | `POST`      | Login a user with JWT authentication          |
| `/api/auth/verify-otp`        | `POST`      | Verify OTP for 2FA after login                |
| `/api/auth/forgetpassword`    | `POST`      | Send password reset link                      |
| `/api/auth/resetpassword/:token` | `POST`    | Reset the password with a provided token      |

---

### **Database Design**

#### **User Schema**
Each user has the following fields:

- **First Name & Last Name**
- **Email (unique)**
- **Password (hashed)**
- **Phone Number**
- **Address**
- **Roles (Admin, Client, Livreur)**
- **Devices (with verification status)**
- **isEmailVerified (boolean)**
- **lastLogin & createdAt**

#### **Role Schema**
The role schema contains:

- **Role Name (Admin, Client, Livreur)**
- **CreatedAt**

---

### **Security Features**

1. **Password Hashing with Bcrypt:** All user passwords are hashed before saving to the database using Bcrypt with a salt factor.
   
2. **JWT Authentication:** After login, users receive a JWT for secure communication with the API. The token includes user details and permissions for accessing routes.

3. **Two-Factor Authentication (2FA):** After login, users are required to verify their identity by providing a One-Time Password (OTP) sent via email or SMS.

4. **Error Handling:** Comprehensive error handling for invalid login attempts, expired JWT tokens, or incorrect OTP entries.

---

### **Unit Testing**

Unit tests are implemented using **Jest** or **Mocha**. Here are some of the key tests:

- **Registration Test:**
  - Validates if a new user is registered with the correct details.
  - Ensures proper error handling for duplicate email registration.
  
- **Login Test:**
  - Verifies JWT generation on successful login.
  - Ensures error handling for invalid credentials.
  
- **2FA Test:**
  - Ensures the OTP is generated and validated correctly during the 2FA process.

Test files are located in the `/tests/` folder. Run the tests with the following command:

```bash
npm run test
```

---

### **Project Objectives**

The key learning objectives for this project are:

- **MongoDB & Mongoose:** Learn to create schemas and interact with a NoSQL database.
- **JWT Authentication:** Secure user sessions using JSON Web Tokens.
- **Two-Factor Authentication (2FA):** Implement multi-layer security to protect user accounts.
- **RESTful API Design:** Create scalable APIs that follow the REST principles.
- **Unit Testing:** Write robust tests to ensure the functionality and security of the authentication system.

---

### **Jira Board** 

[![Jira Logo](https://www.vectorlogo.zone/logos/atlassian_jira/atlassian_jira-icon.svg)](https://elmorjanimohamed.atlassian.net/jira/software/projects/AAA/boards/3)

You can track the progress and tasks for this project on the Jira board:  
**[AlloMedia Jira Board](https://elmorjanimohamed.atlassian.net/jira/software/projects/AAA/boards/3)**