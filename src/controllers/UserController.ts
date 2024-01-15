import { NextFunction, Response } from 'express';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';
import { validationResult } from 'express-validator';

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    try {
      const { firstName, lastName, email, password, role, tenantId } = req.body;

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId
      });
      res.status(201).json(user);
    } catch (error) {
      return next(error);
    }
  }
}
