const express = require('express');
const router = express.Router();
const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    getUserProfile,
    updateUserProfile
} = require('../controllers/UserListController');

// Debug middleware
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Request Body:', req.body);
    next();
});
const validateCompanyField = (req, res, next) => {
    const { role, company } = req.body;
    if ((role === 'client' || role === 'client user') && !company) {
        return res.status(400).json({
            message: 'Company is required for client and client user roles',
            success: false
        });
    }
    next();
};

// Wrap route handlers with try-catch
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Route order matters - place more specific routes first
router.get('/users/profile/:loginName', asyncHandler(getUserProfile));
router.put('/users/profile/:id', asyncHandler(updateUserProfile));

// General user management routes
router.get('/users', asyncHandler(getAllUsers));
router.post('/users', asyncHandler(createUser));
router.put('/users/:id', asyncHandler(updateUser));

// URL encoding middleware
router.use((req, res, next) => {
    if (req.params.loginName) {
        req.params.loginName = decodeURIComponent(req.params.loginName);
    }
    next();
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('UserList Router Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        success: false
    });
});

module.exports = router;