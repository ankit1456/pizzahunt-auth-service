import { ERoles, roles, TUpdateUserRequest } from '@customTypes/auth.types';
import { formatEnumMessage } from '@utils/formatEnumMessage';
import { checkSchema as validationSchema } from 'express-validator';

export default validationSchema({
  email: {
    trim: true,
    notEmpty: {
      errorMessage: 'email is required',
      bail: true
    },
    isEmail: {
      errorMessage: 'email is not valid'
    }
  },

  firstName: {
    trim: true,
    notEmpty: {
      errorMessage: 'first name is required',
      bail: true
    },
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'first name must contain 2 to 30 characters'
    }
  },
  lastName: {
    notEmpty: {
      errorMessage: 'last name is required',
      bail: true
    },
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'last name must contain 2 to 30 characters'
    }
  },

  password: {
    notEmpty: {
      errorMessage: 'password is required',
      bail: true
    },
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
    trim: true,
    isIn: {
      options: [roles],
      errorMessage: `role must be ${formatEnumMessage(roles)}`
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
      errorMessage: 'email is not valid'
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
      errorMessage: `role must be ${formatEnumMessage(roles)}`
    }
  },
  tenantId: {
    ...commonUpdationOptions,
    isUUID: {
      errorMessage: 'tenantId is not valid'
    }
  }
});
