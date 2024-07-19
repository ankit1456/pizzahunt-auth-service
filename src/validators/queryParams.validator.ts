import { checkSchema as validationSchema } from 'express-validator';

export default validationSchema(
  {
    page: {
      toInt: true,
      customSanitizer: {
        options: (value: number) => (Number.isNaN(value) ? 1 : value)
      }
    },
    limit: {
      toInt: true,
      customSanitizer: {
        options: (value: number) => (Number.isNaN(value) ? 8 : value)
      }
    },
    q: {
      trim: true,
      customSanitizer: {
        options: (value: string) => value ?? ''
      }
    },
    role: {
      trim: true,
      customSanitizer: {
        options: (value: string) => value ?? ''
      }
    }
  },
  ['query']
);
