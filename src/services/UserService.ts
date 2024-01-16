import createHttpError, { HttpError } from 'http-errors';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import { CredentialService } from './CredentialService';

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
        throw createHttpError(500, 'Failed to create user');
      } else {
        throw err;
      }
    }
  }

  findByEmail(email: string, options?: { includePassword?: boolean }) {
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
    return this.userRepository.findOne(queryOptions);
  }

  findById(id: string | undefined) {
    return this.userRepository.findOneBy({ id });
  }

  getAllUsers() {
    return this.userRepository.find();
  }
  deleteUser(userId: string | undefined) {
    return this.userRepository.delete({ id: userId });
  }
}
