import { NextFunction, Request, Response } from 'express';
import { matchedData, validationResult } from 'express-validator';
import createHttpError from 'http-errors';
import { Logger } from 'winston';
import { UserService } from '../services';
import { TQueryParams } from '../types';
import {
  Roles,
  TCreateUserRequest,
  TUpdateUserRequest
} from '../types/auth.types';

export default class UserController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async createUser(req: TCreateUserRequest, res: Response, next: NextFunction) {
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
        role
      });

      const user = await this.userService.createUser({
        firstName,
        lastName,
        email,
        password,
        role: role ?? Roles.CUSTOMER,
        tenantId: role === Roles.MANAGER ? tenantId : undefined
      });
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      return next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const queryParams = matchedData(req, {
      onlyValidData: true
    }) as TQueryParams;

    try {
      const users = await this.userService.getAllUsers(queryParams);

      this.logger.info('All users fetched');
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

      this.logger.info('User fetched', {
        id: userId
      });

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
      return next(error);
    }
  }

  async updateUser(req: TUpdateUserRequest, res: Response, next: NextFunction) {
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

      const role = user.id === req.auth.sub ? Roles.ADMIN : req.body.role;

      const { firstName, lastName, email, tenantId } = req.body;

      await this.userService.updateUser(userId, {
        firstName,
        lastName,
        email,
        role,
        tenantId
      });

      this.logger.info('User updated', {
        id: userId
      });

      res.json({ id: user.id });
    } catch (error) {
      return next(error);
    }
  }
}
