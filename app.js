// app.js
require('dotenv').config();
const express    = require('express');
const connectDB  = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
