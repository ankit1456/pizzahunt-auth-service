import { checkSchema as validationSchema } from 'express-validator';
import { roles } from '../types/auth.types';

const commonOptions = {
  trim: true,
  notEmpty: true
};

export default validationSchema({
  email: {
    ...commonOptions,
    errorMessage: 'Email is required',
    isEmail: {
      errorMessage: 'Not a valid email'
    }
  },

  firstName: {
    ...commonOptions,
    errorMessage: 'First name is required!',
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'First name should be between 2 and 30 characters'
    }
  },
  lastName: {
    ...commonOptions,
    errorMessage: 'Last name is required!',
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'Last name should be between 2 and 30 characters'
    }
  },

  password: {
    ...commonOptions,
    errorMessage: 'Password is required!',
    isLength: {
      options: {
        min: 8
      },
      errorMessage: 'Password length should be at least 8 chars long'
    }
  },

  role: {
    optional: true,
    ...commonOptions,
    isIn: {
      options: [roles],
      errorMessage: `Role must be one of: ${roles.join(',')}`
    }
  }
});

const commonUpdationOptions = {
  optional: true,
  trim: true
};

export const updateUserValidator = validationSchema({
  email: {
    ...commonUpdationOptions,
    isEmail: {
      errorMessage: 'Not a valid email'
    }
  },

  firstName: {
    ...commonUpdationOptions,
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'First name should be between 2 and 30 characters'
    }
  },
  lastName: {
    ...commonUpdationOptions,
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'Last name should be between 2 and 30 characters'
    }
  },

  password: {
    ...commonUpdationOptions,
    isLength: {
      options: {
        min: 8
      },
      errorMessage: 'Password length should be at least 8 characters long'
    }
  },
  role: {
    ...commonUpdationOptions,
    isIn: {
      options: [roles],
      errorMessage: `Role must be one of: ${roles.join(', ')}`
    }
  }
});

export const validateUserId = validationSchema({
  userId: {
    in: ['params'],
    isUUID: {
      errorMessage: 'Not a valid uuid'
    }
  }
});
