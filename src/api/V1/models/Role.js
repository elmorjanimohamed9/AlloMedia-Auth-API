import mongoose from 'mongoose';

// Schéma pour les rôles
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a role name'],
    unique: true,
    enum: ['Admin', 'Client', 'Livreur'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Role = mongoose.model('Role', roleSchema);
export default Role;
