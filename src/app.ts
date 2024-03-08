import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { HttpError } from 'http-errors';
import 'reflect-metadata';
import { Config } from './config';
import logger from './config/logger';
import authRouter from './routes/authRoutes';
import tenantRouter from './routes/tenantRoutes';
import userRouter from './routes/userRoutes';

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
  const healthcheck = {
    message: 'OK',
    timestamp: Date.now()
  };
  try {
    res.send(healthcheck);
  } catch (error) {
    if (error instanceof Error) {
      healthcheck.message = error.message;
    }
    res.status(503).send();
  }
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
        message: errMessage,
        path: '',
        location: ''
      }
    ]
  });
});

export default app;
