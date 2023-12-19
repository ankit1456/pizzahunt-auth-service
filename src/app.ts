import 'reflect-metadata';

import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/authRoutes';
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to Auth Service');
});

app.use('/api/auth', authRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        message: err.message,
        path: '',
        location: ''
      }
    ]
  });
});

export default app;
