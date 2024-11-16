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

  async create(user: TUser) {
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

  findOne(
    filterBy: keyof User,
    value: string | undefined,
    options?: { includePassword?: boolean }
  ) {
    const queryOptions: FindOneOptions<User> = {
      where: { [filterBy]: value },
      relations: { tenant: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        password: options?.includePassword,
        role: true,
        createdAt: true,
        tenant:
          filterBy === 'email'
            ? {
                id: true
              }
            : {
                name: true,
                address: true
              }
      }
    };

    return this.userRepository.findOne(queryOptions);
  }

  getAll(queryParams: TQueryParams) {
    let queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder = this.filterUsers(queryBuilder, queryParams);
    return paginate<User>(queryBuilder, queryParams);
  }

  delete(userId: string | undefined) {
    return this.userRepository.delete({ id: userId });
  }

  update(
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
