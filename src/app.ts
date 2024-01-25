import 'reflect-metadata';

import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import authRouter from './routes/authRoutes';
import tenantRouter from './routes/tenantRoutes';
import userRouter from './routes/userRoutes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Config } from './config';

const app = express();

app.use(
  cors({
    origin: [Config.WHITELIST_ORIGIN!],
    credentials: true
  })
);

app.use(express.static('public'));

app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Auth Service is running');
});

app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/users', userRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, {
    errorName: err.name
  });
  const statusCode = err.statusCode || err.status || 500;

  let errMessage = err.message;
  if (err.name === 'UnauthorizedError') {
    errMessage = 'You are not authorized';
  }
  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: errMessage,
        path: '',
        location: ''
      }
    ]
  });
});

export default app;
