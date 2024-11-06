import { TUser } from '@customTypes/auth.types';
import { TQueryParams } from '@customTypes/common';
import { User } from '@entity';
import { paginate } from '@utils';
import { BadRequestError } from '@utils/errors';
import {
  Brackets,
  FindOneOptions,
  Repository,
  SelectQueryBuilder
} from 'typeorm';
import CredentialService from './CredentialService';

export default class UserService {
  constructor(
    private readonly userRepository: Repository<User>,
    private readonly credentialService: CredentialService
  ) {}

  async createUser(user: TUser) {
    const { firstName, lastName, email, role, tenantId } = user;

    const userExists = await this.userRepository.findOneBy({
      email
    });

    if (userExists) throw new BadRequestError('Email already exists');

    const hashedPassword = await this.credentialService.generateHashedPassword(
      user.password
    );

    return this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      tenant: tenantId ? { id: tenantId } : null
    });
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
        'role',
        'createdAt'
      ];
    }
    return this.userRepository.findOne(queryOptions);
  }

  findById(id: string | undefined) {
    return this.userRepository.findOne({
      where: {
        id
      },
      relations: {
        tenant: true
      },
      select: {
        tenant: {
          name: true,
          address: true
        }
      }
    });
  }

  getAllUsers(queryParams: TQueryParams) {
    let queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder = this.filterUsers(queryBuilder, queryParams);
    return paginate<User>(queryBuilder, queryParams);
  }

  deleteUser(userId: string | undefined) {
    return this.userRepository.delete({ id: userId });
  }

  updateUser(
    userId: string | undefined,
    updateUserPayload: Omit<TUser, 'password'>
  ) {
    const { firstName, lastName, email, role, tenantId } = updateUserPayload;

    return this.userRepository.update(
      { id: userId },
      {
        firstName,
        lastName,
        role,
        email,
        tenant: tenantId ? { id: tenantId } : null
      }
    );
  }

  filterUsers(
    queryBuilder: SelectQueryBuilder<User>,
    queryParams: TQueryParams
  ) {
    if (queryParams.q) {
      const searchTerm = `%${queryParams.q}%`;

      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm
          })
            .orWhere('CONCAT(user.firstName, user.lastName) ILike :q', {
              q: searchTerm
            })
            .orWhere('user.email ILike :q', { q: searchTerm });
        })
      );
    }

    if (queryParams.role) {
      queryBuilder.andWhere('user.role = :role', {
        role: queryParams.role
      });
    }

    return queryBuilder
      .leftJoin('user.tenant', 'tenant')
      .addSelect(['tenant.id', 'tenant.name', 'tenant.address'])
      .orderBy('user.createdAt', 'DESC');
  }
}
