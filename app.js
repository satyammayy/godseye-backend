// app.js
require('dotenv').config();
const express    = require('express');
const path       = require('path');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// 1. Connect to database
connectDB();

// 2. Built-in middleware to parse JSON
app.use(express.json());

// 3. Serve static files from /public
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// 4. API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

// 5. Fallback: serve index.html on all other GETs
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// 6. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
