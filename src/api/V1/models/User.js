import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schéma pour les utilisateurs
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'Please provide a first name'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Please provide a last name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please provide a valid email address'],
        validate: {
            validator: async function (value) {
                if (this.isNew || this.isModified('email')) {
                    const emailCount = await this.constructor.countDocuments({ email: value });
                    return !emailCount;
                }
                return true;
            },
            message: 'Email already exists'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate: {
            validator: function(value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and must be at least 8 characters long.',
        },
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        match: [/^\d{10,15}$/, 'Please provide a valid phone number']  
    },
    address: {
        type: String,
        required: [true, 'Please provide an address']
    },
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Role'  
        }
    ],
    isEmailVerified: {
        type: Boolean,
        default: false 
    },
    devices: [{
        userAgent: String,
        ipAddress: String,
        lastLogin: Date,
        isVerified: { type: Boolean, default: false }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date 
    },
    isLocked: { type: Boolean, default: false },
    lockUntil: { type: Date },
});


// Méthode pour mettre à jour la dernière connexion
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

userSchema.methods.addDevice = function(userAgent, ipAddress) {
    const existingDevice = this.devices.find(
      device => device.userAgent === userAgent && device.ipAddress === ipAddress
    );
  
    if (existingDevice) {
      existingDevice.lastLogin = new Date();
      existingDevice.isVerified = true;
    } else {
      this.devices.push({
        userAgent,
        ipAddress,
        lastLogin: new Date(),
        isVerified: false
      });
    }
    return this.save();
  };
  
  userSchema.methods.isDeviceVerified = function(userAgent, ipAddress) {
    const device = this.devices.find(
      d => d.userAgent === userAgent && d.ipAddress === ipAddress
    );
    return device ? device.isVerified : false;
  };  

const User = mongoose.model('User', userSchema);
export default User;
