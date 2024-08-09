import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import 'reflect-metadata';
import { Config } from './config';
import { globalErrorHandler } from './middlewares';
import { authRouter, healthRouter, tenantRouter, userRouter } from './routes';

const app = express();

// middlewares
app.use(
  cors({
    origin: [Config.WHITELIST_ORIGIN!],
    credentials: true
  })
);
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

// routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/users', userRouter);

app.use(globalErrorHandler);

export default app;
