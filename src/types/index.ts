import { Request } from 'express';
import { Roles } from './roles.enum';

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Roles;
  tenantId?: string;
}

export interface IRegisterUserRequest extends Request {
  body: IUser;
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

export interface ICreateUserRequest extends Request {
  body: IUser;
}
export interface IUpdateUserRequest extends Request {
  body: IUser;
}

export const roles = ['admin', 'manager', 'customer'];
