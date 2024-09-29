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
                const emailCount = await this.model('User').countDocuments({ email: value });
                return !emailCount;  
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

// Hook pour crypter le mot de passe avant de sauvegarder l'utilisateur
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode pour mettre à jour la dernière connexion
userSchema.methods.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
