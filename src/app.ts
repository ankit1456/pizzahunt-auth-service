import { Config } from '@config';
import { globalErrorHandler } from '@middlewares';
import { authRouter, healthRouter, tenantRouter, userRouter } from '@routes';
import { NotFoundError } from '@utils/errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import 'reflect-metadata';

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
app.use('/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api/users', userRouter);

app.all('*', (req, res, next) =>
  next(new NotFoundError(`Can't find ${req.url} on the server`))
);

app.use(globalErrorHandler);

export default app;
