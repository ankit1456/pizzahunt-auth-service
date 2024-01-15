import { CredentialService } from './CredentialService';
import createHttpError, { HttpError } from 'http-errors';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private credentialService: CredentialService
  ) {}

  async create(user: UserData) {
    try {
      const userExists = await this.userRepository.findOneBy({
        email: user.email
      });

      if (userExists) {
        throw createHttpError(400, 'Email already exists');
      }

      const hashedPassword =
        await this.credentialService.generateHashedPassword(user.password);

      return await this.userRepository.save({
        ...user,
        tenantId: user.tenantId ? { id: user.tenantId } : undefined,
        password: hashedPassword
      });
    } catch (err) {
      if (!(err instanceof HttpError)) {
        throw createHttpError(500, 'Failed to register user');
      } else {
        throw err;
      }
    }
  }

  async findByEmail(email: string, options?: { includePassword?: boolean }) {
    const queryOptions: FindOneOptions<User> = {
      where: { email }
    };

    if (options?.includePassword) {
      queryOptions.select = [
        'id',
        'firstName',
        'lastName',
        'email',
        'password',
        'role'
      ];
    }
    return await this.userRepository.findOne(queryOptions);
  }

  async findById(id: string) {
    return await this.userRepository.findOneBy({ id });
  }
}
