import { Request } from 'express';

export type CreateTenantDto = {
  name: string;
  address: string;
};

export interface CreateTenantRequest extends Request {
  body: CreateTenantDto;
}
