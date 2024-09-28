import Role from '../models/Role.js';
import { roleValidationSchema } from '../validations/roleValidation.js'

// Create a new role
export const createRole = async (req, res) => {
    const { error } = roleValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name } = req.body;

    try {
        console.log("Creating role:", name);  // Log the role name
        console.log(await Role.find())
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: `Role with name "${name}" already exists.` });
        }

        const newRole = new Role({ name });
        await newRole.save();
        console.log("Role created:", newRole);  // Log the created role

        res.status(201).json({ message: 'Role created successfully', role: newRole });
    } catch (error) {
        console.error("Error creating role:", error);  // Log the error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Role name must be unique.', error });
        }
        res.status(500).json({ message: 'Error creating role', error });
    }
};

// Get all roles
export const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error });
    }
};

// Get a role by ID
export const getRoleById = async (req, res) => {
    const { id } = req.params;

    try {
        const role = await Role.findById(id);
        if (!role) return res.status(404).json({ message: 'Role not found' });
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching role', error });
    }
};

// Update a role by ID
export const updateRole = async (req, res) => {
    const { error } = roleValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;
    const { name } = req.body;

    try {
        const updatedRole = await Role.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );
        if (!updatedRole) return res.status(404).json({ message: 'Role not found' });
        res.status(200).json({ message: 'Role updated successfully', role: updatedRole });
    } catch (error) {
        res.status(500).json({ message: 'Error updating role', error });
    }
};

// Delete a role by ID
export const deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRole = await Role.findByIdAndDelete(id);
        if (!deletedRole) return res.status(404).json({ message: 'Role not found' });
        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting role', error });
    }
};
