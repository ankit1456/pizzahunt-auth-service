import createHttpError from 'http-errors';
import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create(user: UserData) {
    try {
      return await this.userRepository.save(user);
    } catch (err) {
      const error = createHttpError(500, 'Failed to register user');
      throw error;
    }
  }
}
