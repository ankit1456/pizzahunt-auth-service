import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from '../types/roles.enum';
import { Tenant } from './Tenant';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: Roles.CUSTOMER })
  role: Roles;

  @ManyToOne(() => Tenant)
  tenant: Tenant;
}
