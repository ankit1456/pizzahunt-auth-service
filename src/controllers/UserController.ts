import {
  ERoles,
  TCreateUserRequest,
  TUpdateUserRequest
} from '@customTypes/auth.types';
import { EStatus, TQueryParams } from '@customTypes/common';
import { UserService } from '@services';
import { NotFoundError } from '@utils/errors';
import { NextFunction, Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { Logger } from 'winston';

export default class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: Logger
  ) {
    this.createUser = this.createUser.bind(this);
    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUser = this.getUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

  async createUser(req: TCreateUserRequest, res: Response, next: NextFunction) {
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
      role: role ?? ERoles.CUSTOMER,
      tenantId: role === ERoles.MANAGER ? tenantId : undefined
    });
    res.status(201).json({
      status: EStatus.SUCCESS,
      user: { ...user, password: undefined }
    });
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    const queryParams = matchedData<TQueryParams>(req, {
      onlyValidData: true
    });

    const users = await this.userService.getAllUsers(queryParams);

    this.logger.info('All users fetched');
    res.json({ status: EStatus.SUCCESS, ...users });
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;
    const user = await this.userService.findById(userId);

    if (!user) return next(new NotFoundError('User not found'));

    this.logger.info('User fetched', {
      id: userId
    });

    res.json({ status: EStatus.SUCCESS, user });
  }

  async updateUser(_req: Request, res: Response, next: NextFunction) {
    const req = _req as TUpdateUserRequest;

    const { userId } = req.params;

    this.logger.info('Updating user', {
      id: userId
    });
    const user = await this.userService.findById(userId);

    if (!user) return next(new NotFoundError('User not found'));

    const { firstName, lastName, email, role } = req.body;

    const tenantId =
      user.role === ERoles.MANAGER || req.body.role === ERoles.MANAGER
        ? req.body.tenantId
        : undefined;

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

    res.json({ status: EStatus.SUCCESS, id: user.id });
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;

    this.logger.info('Deleting user', {
      id: userId
    });

    const user = await this.userService.findById(userId);

    if (!user) return next(new NotFoundError('User not found'));

    const response = await this.userService.deleteUser(userId);

    if (response.affected) {
      this.logger.info('User deleted', {
        id: userId
      });
      res.json({ status: EStatus.SUCCESS });
    }
  }
}
