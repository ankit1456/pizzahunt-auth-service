import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import 'reflect-metadata';
import { Config } from './config';
import { globalErrorHandler } from './middlewares';
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
    timestamp: new Date().toLocaleString()
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

app.use(globalErrorHandler);

export default app;
