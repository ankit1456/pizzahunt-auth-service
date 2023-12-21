import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';

export class UserService {
  constructor(private userRepository: Repository<User>) {}

  async create(body: UserData) {
    return await this.userRepository.save(body);
  }
}
