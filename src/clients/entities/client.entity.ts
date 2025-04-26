import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { EconomicStatus } from 'src/economic_status/entities/economic_status.entity';

/**
 * Entidad Client: Información específica del cliente.
 * 
 * La entidad `Client` representa un cliente en el sistema. Cada cliente tiene una relación
 * con un usuario (representado por la entidad `User`), así como con un estado económico
 * (representado por la entidad `EconomicStatus`). Además, se gestionan campos básicos como
 * la dirección, el teléfono y el estado de eliminación.
 * 
 * @entity clients
 */
@Entity('clients')
export class Client {

  /**
   * Identificador único del cliente.
   * 
   * Es generado automáticamente por la base de datos cuando se crea un nuevo cliente.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Dirección del cliente.
   * 
   * Representa la dirección física del cliente, como una calle o una ubicación.
   * 
   * @example "123 Calle Principal, Ciudad"
   */
  @Column()
  address: string;

  /**
   * Teléfono del cliente.
   * 
   * Representa el número telefónico del cliente, el cual puede ser utilizado para
   * contacto directo.
   * 
   * @example "+1 234 567 890"
   */
  @Column()
  phone: string;

  /**
   * Relación con la entidad `User`.
   * 
   * Cada cliente está asociado a un usuario en el sistema. La propiedad `user_id` se
   * gestiona mediante la relación `@OneToOne` con la entidad `User`.
   * 
   * @eager Carga automática de los datos del usuario.
   * @joinColumn Indica que la clave foránea se llama `user_id` en la base de datos.
   */
  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  /**
   * Relación con la entidad `EconomicStatus`.
   * 
   * Cada cliente tiene asociado un estado económico. El estado económico está representado
   * por la entidad `EconomicStatus` y se establece con una relación `@ManyToOne`.
   * 
   * @eager No se carga automáticamente, solo se carga cuando es necesario.
   * @joinColumn Indica que la clave foránea se llama `economic_status_id` en la base de datos.
   */
  @ManyToOne(() => EconomicStatus, (economicStatus) => economicStatus.clients, {
    eager: false,
  })
  @JoinColumn({ name: 'economic_status_id' })
  economicStatus: EconomicStatus;

  /**
   * Estado de eliminación del cliente.
   * 
   * Indica si el cliente ha sido marcado como eliminado. El valor predeterminado es `false`,
   * lo que significa que el cliente no está eliminado. Un valor de `true` indica que el cliente
   * está marcado como eliminado y, por lo tanto, no debe ser mostrado en operaciones normales.
   * 
   * @default false
   */
  @Column({ default: false })
  deleted: boolean;
}
