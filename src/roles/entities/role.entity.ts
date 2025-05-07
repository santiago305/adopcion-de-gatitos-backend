import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from 'users/entities/user.entity';

/**
 * Entidad `Role` que representa los diferentes roles de usuario en el sistema.
 *
 * Cada rol tiene una descripción única, un indicador de si está eliminado lógicamente,
 * y una relación uno-a-muchos con usuarios (`User`).
 */
@Entity('roles')
export class Role {
  /**
   * Identificador único del rol.
   * Se genera automáticamente al insertar un nuevo registro.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Descripción única del rol (por ejemplo: 'admin', 'user', 'moderator').
   */
  @Column({ unique: true })
  description: string;

  /**
   * Campo booleano que indica si el rol fue eliminado lógicamente.
   * Se utiliza para soft deletes (sin borrar físicamente de la base de datos).
   */
  @Column({ default: false })
  deleted: boolean;

  /**
   * Relación uno-a-muchos con la entidad `User`.
   * Un rol puede estar asignado a múltiples usuarios.
   */
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
