import { TGenericBodyRequest } from './common';

export type TTenant = {
  name: string;
  address: string;
};

export type TCreateTenantRequest = TGenericBodyRequest<TTenant>;
export type TUpdateTenantRequest = TGenericBodyRequest<TTenant>;
