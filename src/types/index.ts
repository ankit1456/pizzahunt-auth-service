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

export interface AuthRequest extends Request {
  auth: {
    id?: string;
    sub: string;
    role: string;
  };
}

export type AuthCookies = {
  accessToken: string;
  refreshToken: string;
};

export interface IRefreshTokenPayload {
  id: string;
  sub: string;
}
