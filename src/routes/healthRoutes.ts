import { Router } from 'express';

const router = Router();

router.get('/', (_, res) => {
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
    res.status(503).send(healthcheck);
  }
});

export default router;
