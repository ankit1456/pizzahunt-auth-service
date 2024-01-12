import { Request, Response } from 'express';

export class TenantController {
  createTenant(req: Request, res: Response) {
    res.status(201).json({});
  }
}
