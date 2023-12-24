import { Request } from 'express';
import { Roles } from './roles.enum';

export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
}
export interface RegisterUserRequest extends Request {
  body: UserData;
}
