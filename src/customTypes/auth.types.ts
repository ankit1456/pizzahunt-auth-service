import { Request } from 'express';
import { TGenericBodyRequest } from './common';
import { JwtPayload } from 'jsonwebtoken';
import { ERoles } from '@utils/constants';

export type TUser = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: ERoles;
  tenantId?: string;
};

type TCredentials = {
  email: string;
  password: string;
};

export type TRegisterUserRequest = TGenericBodyRequest<TUser>;
export type TLoginUserRequest = TGenericBodyRequest<TCredentials>;

type TRequestAuthPayload = {
  sub: string;
  role: ERoles;
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  tenantId?: string;
};

export type TAuthRequest = Request & {
  auth: TRequestAuthPayload;
};

export type TAuthCookies = {
  accessToken: string;
  refreshToken: string;
};

export type TRefreshTokenPayload = {
  id: string;
  sub: string;
};

export type TCreateUserRequest = TGenericBodyRequest<TUser>;
export type TUpdateUserRequest = TGenericBodyRequest<
  Omit<TUser, 'password'>
> & {
  auth: TRequestAuthPayload;
};

export type TJwtPayload = TRequestAuthPayload & JwtPayload;
