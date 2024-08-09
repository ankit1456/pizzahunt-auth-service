import bcrypt from 'bcryptjs';

export default class CredentialService {
  generateHashedPassword(password: string) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  comparePassword(userPassword: string, passwordHash: string) {
    return bcrypt.compare(userPassword, passwordHash);
  }
}
