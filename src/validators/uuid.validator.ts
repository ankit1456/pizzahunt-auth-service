import { checkSchema } from 'express-validator';

export const validateUUID = checkSchema({
  tenantId: {
    in: ['params'],
    isUUID: {
      errorMessage: 'Not a valid uuid'
    }
  }
});
