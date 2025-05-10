const UserModel = require("../models/Users");
const bcrypt = require('bcryptjs');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await UserModel.find({}, { password: 0 }); // Exclude password from response
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Create new user
const createUser = async (req, res) => {
    try {
        const { name, email, password, designation, mobile, dateOfBirth, dateOfJoining, address, department, role, status, company } = req.body;


        // Check if email already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered",
                success: false,
            });
        }

        // Create new user
        const newUser = new UserModel({
            name,
            email,
            password,
            designation,
            mobile,
            dateOfBirth,
            dateOfJoining,
            address,
            department,
            role: role || "visitor",
            status: status || "active",
            company: (role === 'client' || role === 'client user') ? company : undefined
        });


        await newUser.save();

        // Return user without password
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: "User created successfully",
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // If password is being updated, hash it
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(updates.password, salt);
        }

        const user = await UserModel.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        res.json({
            message: "User updated successfully",
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};

// Get user profile by login name (email)
const getUserProfile = async (req, res) => {
    try {
        const { loginName } = req.params;
        
        // Decode the loginName if it's URL encoded
        const decodedLoginName = decodeURIComponent(loginName);
        
        // First try exact email match
        let user = await UserModel.findOne(
            { email: decodedLoginName },
            { password: 0 } // Exclude password from response
        );

        // If no user found by email, try case-insensitive name match
        if (!user) {
            user = await UserModel.findOne(
                { name: new RegExp(`^${decodedLoginName}$`, 'i') },
                { password: 0 }
            );
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove sensitive fields from updates
        delete updates.password;
        delete updates._id;

        // Validate required fields
        const requiredFields = ['name', 'email', 'designation', 'mobile', 'department'];
        const missingFields = requiredFields.filter(field => !updates[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`,
                success: false
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            id,
            updates,
            { 
                new: true, 
                runValidators: true,
                context: 'query'
            }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        res.json({
            message: "Profile updated successfully",
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            success: false
        });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    getUserProfile,
    updateUserProfile
};