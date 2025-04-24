import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EconomicStatus } from 'src/economic_status/entities/economic_status.entity';

/**
 * Entidad Client: información específica del cliente.
 */
@Entity('clients')
export class Client {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column({ default: false })
  deleted: boolean;

  // Relación con User
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relación con EconomicStatus
  @ManyToOne(() => EconomicStatus, (economicStatus) => economicStatus.clients, {
    eager: false,
  })
  @JoinColumn({ name: 'economic_status_id' })
  economicStatus: EconomicStatus;
}
