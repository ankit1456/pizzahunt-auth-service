import { Response } from 'express';
import { UserService } from '../services/UserService';
import { RegisterUserRequest } from '../types';

export class AuthController {
  constructor(private userService: UserService) {}

  register(req: RegisterUserRequest, res: Response) {
    const newUser = this.userService.create(req.body);

    res.status(201).json(newUser);
  }
}
