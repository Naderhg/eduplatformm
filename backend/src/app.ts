import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { connectDB } from './config/db';
import { specs } from './config/swagger';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import lessonRoutes from './routes/lesson.routes';
import assignmentRoutes from './routes/assignment.routes';
import submissionRoutes from './routes/submission.routes';
import studentRoutes from './routes/student.routes';
import fileRoutes from './routes/file.routes';
import commentRoutes from './routes/comment.routes';
import { errorHandler, notFound } from './middleware/error';
import './models/user.model'; // Import the model to ensure it's registered
import './models/session.model'; // Import the model to ensure it's registered
import './models/course.model'; // Import the model to ensure it's registered
import './models/enrollment.model'; // Import the model to ensure it's registered
import './models/lesson.model'; // Import the model to ensure it's registered
import './models/assignment.model'; // Import the model to ensure it's registered
import './models/submission.model'; // Import the model to ensure it's registered
import './models/comment.model'; // Import the model to ensure it's registered

dotenv.config();

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize database connection
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'http://localhost:8080',  // Common React dev server
  'http://localhost:8081',  // Vite dev server
  'http://localhost:8082',  // Current Vite dev server
  'http://localhost:3000',  // Common React dev server
  'http://localhost:5000',  // Common React dev server
  process.env.FRONTEND_URL, // Any URL from environment variables
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow all origins
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  // Don't set wildcard origin when credentials are enabled
}));

// Handle preflight requests
app.options('*', cors());

app.use(morgan('dev'));

// API Documentation
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(specs)
);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/comments', commentRoutes);

// Only serve thumbnails publicly (for course previews)
app.use('/uploads/thumbnails', express.static(path.join(__dirname, '../uploads/thumbnails')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    error: `Cannot ${req.method} ${req.path}`
  });
});

// Database connection is already initialized at the top

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
