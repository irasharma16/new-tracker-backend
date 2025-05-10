const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword, changePassword } = require('../controllers/AuthController');
const { loginValidation} = require('../middlewares/AuthValidation');

// Debug middleware
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Request Body:', req.body);
    next();
});

// Wrap route handlers with try-catch
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Auth routes
// router.post('/signup', signupValidation, asyncHandler(signup));
router.post('/login', loginValidation, asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.post('/change-password', asyncHandler(changePassword));

// Error handling middleware specific to auth routes
router.use((err, req, res, next) => {
    console.error('Auth Router Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        success: false
    });
});

module.exports = router;