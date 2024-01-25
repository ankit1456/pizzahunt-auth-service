import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { UserService } from '../services/UserService';
import { CreateUserRequest } from '../types';
import { Roles } from '../types/roles.enum';
import { Logger } from 'winston';
import { logError } from '../utils/logError';

export class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async createUser(req: CreateUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({
        errors: result.array()
      });
    }
    try {
      const { firstName, lastName, email, password, role, tenantId } = req.body;

      this.logger.debug('Creating user', {
        firstName,
        lastName,
        email,
        password: '*******',
        role
      });

      const user = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
        role: role ?? Roles.CUSTOMER,
        tenantId
      });
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      logError(error, "Couldn't create the user");
      return next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers();

      this.logger.info('All users fetched');
      res.json(users);
    } catch (error) {
      logError(error, "Couldn't fetch all the users");
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

      this.logger.info('User fetched', {
        id: userId
      });

      res.json(user);
    } catch (error) {
      logError(error, "Couldn't fetch user");
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

      this.logger.info('Deleting user', {
        id: userId
      });

      const user = await this.userService.findById(userId);

      if (!user) throw createHttpError(404, 'User not found');

      const result = await this.userService.deleteUser(userId);

      if (result.affected) {
        this.logger.info('User deleted', {
          id: userId
        });
        res.json({ message: 'User deleted' });
      }
    } catch (error) {
      logError(error, "Couldn't delete the user");
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

      this.logger.info('Updating user', {
        id: userId
      });
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

      this.logger.info('User updated', {
        id: userId
      });

      res.json({ id: user.id });
    } catch (error) {
      logError(error, "Couldn't update the user");
      return next(error);
    }
  }
}
