// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/authRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // or whatever your frontend port is
  credentials: true
}));

// Routes
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

// Define port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));