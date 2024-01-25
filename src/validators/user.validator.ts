import { checkSchema as validationSchema } from 'express-validator';
import { roles } from '../types';

export default validationSchema({
  email: {
    trim: true,
    notEmpty: {
      errorMessage: 'Email is required'
    },
    isEmail: {
      errorMessage: 'Not a valid email'
    }
  },

  firstName: {
    trim: true,
    errorMessage: 'First name is required!',
    notEmpty: true,
    isLength: {
      options: {
        max: 30
      },
      errorMessage: 'First name should not exceed 30 characters'
    }
  },
  lastName: {
    trim: true,
    errorMessage: 'Last name is required!',
    notEmpty: true,
    isLength: {
      options: {
        max: 30
      },
      errorMessage: 'Last name should not exceed 30 characters'
    }
  },

  password: {
    trim: true,
    errorMessage: 'Password is required!',
    notEmpty: true,
    isLength: {
      options: {
        min: 8
      },
      errorMessage: 'Password length should be at least 8 chars long'
    }
  },

  role: {
    optional: true,
    trim: true,
    notEmpty: true,
    isIn: {
      options: [roles],
      errorMessage: `Role must be one of: ${roles.join(',')}`
    }
  }
});

export const updateUserValidator = validationSchema({
  email: {
    optional: true,
    trim: true,
    isEmail: {
      errorMessage: 'Not a valid email'
    }
  },

  firstName: {
    optional: true,
    trim: true,
    notEmpty: true,
    isLength: {
      options: {
        max: 30
      },
      errorMessage: 'First name should not exceed 30 characters'
    }
  },
  lastName: {
    optional: true,
    trim: true,
    notEmpty: true,
    isLength: {
      options: {
        max: 30
      },
      errorMessage: 'Last name should not exceed 30 characters'
    }
  },

  password: {
    optional: true,
    trim: true,
    notEmpty: true,
    isLength: {
      options: {
        min: 8
      },
      errorMessage: 'Password length should be at least 8 chars long'
    }
  },
  role: {
    optional: true,
    trim: true,
    notEmpty: true,
    errorMessage: `Role must be one of: ${roles.join(', ')}`,
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
