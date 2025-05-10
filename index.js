const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();
require('./models/db');

// Import Routers
const AuthRouter = require('./Routes/AuthRouter');
const PhaseRouter = require('./Routes/PhaseRouter');
const ClientRouter = require('./Routes/clientRouter');
const PriorityRouter = require('./Routes/priorityRouter');
const ProjectRouter = require('./Routes/projectrouter');
const IssueRouter = require('./Routes/IssueRouter');
const ProcessRouter = require('./Routes/ProcessRouter');
const SizeRouter = require('./Routes/SizeRouter');
const StatusRouter = require('./Routes/StatusRouter');
const LevelRouter = require('./Routes/LevelRouter');
const EmpRouter = require('./Routes/EmpRouter');
const ModuleRouter = require('./Routes/ModuleRouter');
const ResolutionTypeRouter = require('./Routes/ResolutionTypeRouter');
const TeamRouter = require('./Routes/TeamRouter');
const RegisterIssueRouter = require('./Routes/RegisterIssueRouter');
const ClientVisit = require('./Routes/ClientVisitRouter');
const TimeSheetRouter = require('./Routes/timeSheetRouter');
const UserListRouter = require('./Routes/UserListRouter');

const app = express();
const PORT = process.env.PORT || 8080;

const HOST = process.env.HOST || 'localhost';  // Updated to localhost for local development

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Change to Frontend URL (localhost for local dev)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ensure uploads directories exist
const uploadDirs = ['./uploads', './uploads/timesheets', './uploads/images'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// File Upload Setup
const timeSheetStorage = multer.diskStorage({
    destination: './uploads/timesheets',
    filename: function (req, file, cb) {
        cb(null, 'timesheet-' + Date.now() + path.extname(file.originalname));
    }
});

const timeSheetUpload = multer({
    storage: timeSheetStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|docx?|xlsx?|csv/i;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Error: Only images, PDFs, and Office documents are allowed!'), false);
        }
    }
});

// File Upload Route
app.post('/upload', timeSheetUpload.single('file'), (req, res) => {
    if (req.file) {
        res.json({ message: 'File uploaded successfully', filename: req.file.filename });
    } else {
        res.status(400).json({ message: 'No file uploaded' });
    }
});

// File Routes
app.get('/uploads/timesheets/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'uploads', 'timesheets', req.params.filename);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

app.get('/download/:filename', (req, res) => {
    const filepath = path.join(__dirname, 'uploads', 'timesheets', req.params.filename);
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

// Application Routes
app.get('/ping', (req, res) => res.send('PONG'));

app.use('/auth', AuthRouter);
app.use('/phase', PhaseRouter);
app.use('/client', ClientRouter);
app.use('/priority', PriorityRouter);
app.use('/Project', ProjectRouter);
app.use('/issues', IssueRouter);
app.use('/process', ProcessRouter);
app.use('/size', SizeRouter);
app.use('/status', StatusRouter);
app.use('/employees', EmpRouter);
app.use('/levels', LevelRouter);
app.use('/modules', ModuleRouter);
app.use('/resolutionTypes', ResolutionTypeRouter);
app.use('/teams', TeamRouter);
app.use('/registerissue', RegisterIssueRouter);
app.use('/clientvisit', ClientVisit);
app.use('/timesheet', TimeSheetRouter);
app.use('/userlist', UserListRouter);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Error Handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        message: 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Start Server
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://localhost:8080`);
});

module.exports = app;
