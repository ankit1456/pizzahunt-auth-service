import { Request } from 'express';

export type TTenant = {
  name: string;
  address: string;
};

export type TPartialTenant = Partial<{
  name: string;
  address: string;
}>;

interface GenericRequest<T> extends Request {
  body: T;
}

export type TCreateTenantRequest = GenericRequest<TTenant>;
export type TUpdateTenantRequest = GenericRequest<TPartialTenant>;
