import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import analyticsRoutes from './routes/analytics';
import highlightRoutes from './routes/highlights';
import trackingRoutes from './routes/tracking';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/highlights', highlightRoutes);
app.use('/api/tracking', trackingRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
