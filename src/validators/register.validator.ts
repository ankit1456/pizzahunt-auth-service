import { checkSchema as validationSchema } from 'express-validator';

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
  }
});
