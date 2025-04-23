import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; // <-- ajustá esto a tu path real

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  description: string;

  @Column({ default: false })
  deleted: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
