import bcrypt from 'bcryptjs';

export class CredentialService {
  async generateHashedPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(userPassword: string, passwordHash: string) {
    return await bcrypt.compare(userPassword, passwordHash);
  }
}
