const mongoose = require('mongoose');

const dbURI = process.env.MONGODB_URI || "mongodb+srv://irasharma:STiwwWzAzVDKKxIM@cluster0.5pnk1mu.mongodb.net/issue-tracker?retryWrites=true&w=majority&appName=Cluster0"; // Update with your database URI

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


