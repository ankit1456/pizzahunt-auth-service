import { checkSchema } from 'express-validator';

export default checkSchema({
  name: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Tenant name is required!'
  },
  address: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Tenant address is required!'
  }
});

export const updateTenantValidator = checkSchema({
  name: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 3
      },
      errorMessage: 'Tenant name is too short'
    }
  },
  address: {
    optional: true,
    trim: true,
    isLength: {
      options: {
        min: 3
      },
      errorMessage: 'Tenant address is too short'
    }
  }
});
