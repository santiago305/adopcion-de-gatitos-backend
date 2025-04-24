import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Entidad `Species` que representa diferentes especies en el sistema.
 * Cada especie tiene un nombre y un estado de eliminación lógica.
 */
@Entity('especies')
export class Species {
  /**
   * Identificador único de la especie.
   * Se genera automáticamente al insertar un nuevo registro.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nombre de la especie (por ejemplo: 'Perro', 'Gato').
   */
  @Column()
  name: string;

  /**
   * Campo booleano para eliminación lógica.
   * Permite "eliminar" la especie sin borrarla físicamente.
   */
  @Column({ default: false })
  deleted: boolean;
}
