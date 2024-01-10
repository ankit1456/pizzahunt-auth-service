import createHttpError, { HttpError } from 'http-errors';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import bcrypt from 'bcrypt';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create(user: UserData) {
    try {
      const userExists = await this.userRepository.findOneBy({
        email: user.email
      });

      if (userExists) {
        throw createHttpError(400, 'Email already exists');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);

      return await this.userRepository.save({
        ...user,
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
      queryOptions.select = ['password'];
    }
    return await this.userRepository.findOne(queryOptions);
  }

  async findById(id: string) {
    return await this.userRepository.findOneBy({ id });
  }
}
