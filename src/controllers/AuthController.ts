import { NextFunction, Response } from 'express';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';
import { Logger } from 'winston';
import bcrypt from 'bcrypt';

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger
  ) {}

  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const { firstName, lastName, email, password, role } = req.body;
    this.logger.debug('Request initiated for registering user', {
      firstName,
      lastName,
      email,
      password: '*******',
      role
    });
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role
      });
      this.logger.info('User has been registered', { id: newUser.id });
      res.status(201).json(newUser);
    } catch (error) {
      next(error);
      return;
    }
  }
}
