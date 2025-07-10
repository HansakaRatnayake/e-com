import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';


// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
    origin: "http://localhost:5175",
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
console.log('found.....');
app.use('/api/auth', authRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});