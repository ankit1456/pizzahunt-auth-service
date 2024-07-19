import { checkSchema as validationSchema } from 'express-validator';

export default validationSchema({
  email: {
    trim: true,
    notEmpty: {
      errorMessage: 'email is required'
    },
    isEmail: {
      errorMessage: 'not a valid email'
    }
  },

  firstName: {
    trim: true,
    notEmpty: {
      errorMessage: 'first name is required'
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
    trim: true,
    notEmpty: {
      errorMessage: 'last name is required'
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
    trim: true,
    notEmpty: {
      errorMessage: 'password is required'
    },
    isLength: {
      options: {
        min: 8
      },
      errorMessage: 'password must contain at least 8 characters'
    }
  }
});
