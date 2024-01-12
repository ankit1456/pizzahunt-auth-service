import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Roles } from '../types/roles.enum';

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
}
