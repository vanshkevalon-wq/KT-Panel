const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static upload folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/theory', require('./routes/theoryRoutes'));
app.use('/api/practical', require('./routes/practicalRoutes'));
app.use('/api/questions', require('./routes/pdfRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Kevalon Technology Role-Based Management System API Server Running',
    status: 'active',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
