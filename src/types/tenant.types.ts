import { Request } from 'express';

export interface ITenant {
  name: string;
  address: string;
}

export interface ICreateTenantRequest extends Request {
  body: ITenant;
}
export interface IUpdateTenantRequest extends Request {
  body: ITenant;
}
