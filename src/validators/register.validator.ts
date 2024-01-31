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
    notEmpty: {
      errorMessage: 'First name is required'
    },
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'First name should be between 2 and 30 characters'
    }
  },
  lastName: {
    trim: true,
    notEmpty: {
      errorMessage: 'Last name is required!'
    },
    isLength: {
      options: {
        max: 30,
        min: 2
      },
      errorMessage: 'Last name should be between 2 and 30 characters'
    }
  },

  password: {
    trim: true,
    notEmpty: {
      errorMessage: 'Password is required!'
    },
    isLength: {
      options: {
        min: 8
      },
      errorMessage: 'Password length should be at least 8 chars long'
    }
  }
});
