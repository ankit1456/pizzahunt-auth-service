import { checkSchema as validationSchema } from 'express-validator';

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

export default validationSchema({
  name: {
    trim: true,
    notEmpty: true,
    errorMessage: 'tenant name is required',
    isLength: {
      ...commonNameLengthOptions,
      errorMessage: 'tenant name must contain 3 to 50 characters'
    }
  },
  address: {
    trim: true,
    notEmpty: true,
    errorMessage: 'tenant address is required',
    isLength: {
      ...commonAddressLengthOptions,
      errorMessage: 'tenant address must contain 3 to 100 characters'
    }
  }
});

const commonOptions = {
  optional: true,
  trim: true
};

export const updateTenantValidator = validationSchema({
  name: {
    ...commonOptions,
    isLength: {
      ...commonNameLengthOptions,
      errorMessage: 'tenant name must contain 3 to 50 characters'
    }
  },
  address: {
    ...commonOptions,
    isLength: {
      ...commonAddressLengthOptions,
      errorMessage: 'tenant address must contain 3 to 100 characters'
    }
  }
});

export const validateTenantId = validationSchema({
  tenantId: {
    in: ['params'],
    isUUID: {
      errorMessage: 'not a valid id'
    }
  }
});
