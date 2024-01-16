import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';

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

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers();

      res.json(users);
    } catch (error) {
      return next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }

    try {
      const { userId } = req.params;
      const user = await this.userService.findById(userId);

      if (!user) throw createHttpError(404, 'User not found');

      res.json(user);
    } catch (error) {
      return next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    try {
      const { userId } = req.params;

      const user = await this.userService.findById(userId);

      if (!user) throw createHttpError(404, 'User not found');

      const result = await this.userService.deleteUser(userId);

      if (result.affected) {
        res.json({ message: 'User deleted' });
      }
    } catch (error) {
      return next(error);
    }
  }

  async updateUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    try {
      const { userId } = req.params;

      const user = await this.userService.findById(userId);

      if (!user) {
        throw createHttpError(404, 'User not found');
      }
      const { firstName, lastName, email, password, role, tenantId } = req.body;

      await this.userService.updateUser(userId, {
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId
      });

      res.json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }
}
