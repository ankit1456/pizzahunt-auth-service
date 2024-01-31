import { checkSchema } from 'express-validator';

const commonNameLengthOptions = {
  options: {
    min: 3,
    max: 50
  }
};
const commonAddressLengthOptions = {
  options: {
    min: 3,
    max: 100
  }
};

export default checkSchema({
  name: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Tenant name is required',
    isLength: {
      ...commonNameLengthOptions,
      errorMessage: 'Tenant name should be between 3 and 50 characters'
    }
  },
  address: {
    trim: true,
    notEmpty: true,
    errorMessage: 'Tenant address is required',
    isLength: {
      ...commonAddressLengthOptions,
      errorMessage: 'Tenant address should be between 3 and 100 characters'
    }
  }
});

const commonOptions = {
  optional: true,
  trim: true
};

export const updateTenantValidator = checkSchema({
  name: {
    ...commonOptions,
    isLength: {
      ...commonNameLengthOptions,
      errorMessage: 'Tenant name should be between 3 and 50 characters'
    }
  },
  address: {
    ...commonOptions,
    isLength: {
      ...commonAddressLengthOptions,
      errorMessage: 'Tenant address should be between 3 and 100 characters'
    }
  }
});

export const validateTenantID = checkSchema({
  tenantId: {
    in: ['params'],
    isUUID: {
      errorMessage: 'Not a valid uuid'
    }
  }
});
