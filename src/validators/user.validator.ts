import { checkSchema as validationSchema } from 'express-validator';
import { ERoles, roles, TUpdateUserRequest } from '../types/auth.types';

const commonOptions = {
  trim: true,
  notEmpty: true
};

export default validationSchema({
  email: {
    ...commonOptions,
    errorMessage: 'email is required',
    isEmail: {
      errorMessage: 'not a valid email'
    }
  },

  firstName: {
    ...commonOptions,
    errorMessage: 'first name is required',
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'first name must contain 2 to 30 characters'
    }
  },
  lastName: {
    ...commonOptions,
    errorMessage: 'last name is required',
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'last name must contain 2 to 30 characters'
    }
  },

  password: {
    ...commonOptions,
    errorMessage: 'password is required',
    isLength: {
      options: {
        min: 8
      },
      errorMessage: 'password must contain at least 8 characters'
    }
  },
  tenantId: {
    optional: true,
    trim: true,
    isUUID: {
      errorMessage: 'not a valid tenantId'
    }
  },

  role: {
    optional: true,
    ...commonOptions,
    isIn: {
      options: [roles],
      errorMessage: `role must be one of: ${roles.join(',')}`
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
      errorMessage: 'not a valid email'
    }
  },

  firstName: {
    ...commonUpdationOptions,
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'first name must contain 2 to 30 characters'
    }
  },

  lastName: {
    ...commonUpdationOptions,
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'last name must contain 2 to 30 characters'
    }
  },
  password: {
    custom: {
      options: (value, { req }) => {
        if ('password' in req.body)
          throw new Error('password cannot be updated');

        return true;
      }
    }
  },
  role: {
    ...commonUpdationOptions,
    customSanitizer: {
      options: (role: ERoles, { req }) => {
        const { params, auth } = req as TUpdateUserRequest;
        return params.userId === auth.sub ? ERoles.ADMIN : role;
      }
    },
    isIn: {
      options: [roles],
      errorMessage: `role must be ${roles.join(', ')}`
    }
  },
  tenantId: {
    ...commonUpdationOptions,
    isUUID: {
      errorMessage: 'not a valid tenantId'
    }
  }
});

export const validateUserId = validationSchema({
  userId: {
    in: ['params'],
    isUUID: {
      errorMessage: 'not a valid id'
    }
  }
});
