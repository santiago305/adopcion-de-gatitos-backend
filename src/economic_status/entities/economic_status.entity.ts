import { Client } from "src/clients/entities/client.entity";
import { 
Column, 
Entity, 
OneToMany, 
PrimaryGeneratedColumn 
} from "typeorm";

/**
 * Representa el estado económico de un usuario.
 * 
 * Esta entidad está relacionada con la tabla `economic_status` en la base de datos. 
 * Contiene el nivel económico y está asociada con múltiples clientes a través de la relación 
 * `OneToMany`. Un estado económico puede estar marcado como "eliminado" y puede tener 
 * múltiples clientes asociados que pertenecen a este estado económico.
 * 
 * @entity
 */
@Entity('economic_status')
export class EconomicStatus {

  /**
   * Identificador único del estado económico.
   * 
   * Este es un campo autoincrementable que se genera de forma automática al crear 
   * un nuevo registro. Es la clave primaria de la tabla `economic_status`.
   * 
   * @property {number} id - El identificador único del estado económico.
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Nivel económico.
   * 
   * Este campo almacena el nivel económico del cliente o usuario, como "Bajo", 
   * "Medio" o "Alto". Es único en la base de datos, lo que significa que no 
   * puede haber dos niveles económicos iguales.
   * 
   * @property {string} level - El nivel económico asociado con este estado.
   */
  @Column({ unique: true })
  level: string;

  /**
   * Indicador de eliminación lógica.
   * 
   * Este campo indica si el estado económico ha sido "eliminado" de forma lógica. 
   * Por defecto, es `false`, lo que significa que el estado económico no ha sido eliminado.
   * 
   * @property {boolean} deleted - Flag que indica si el estado económico ha sido eliminado.
   * @default false
   */
  @Column({ default: false })
  deleted: boolean;

  /**
   * Relación uno a muchos con la entidad `Client`.
   * 
   * Un estado económico puede estar asociado con múltiples clientes. Este campo representa 
   * la relación entre la entidad `EconomicStatus` y la entidad `Client`. Un cliente puede 
   * tener un solo estado económico, pero un estado económico puede estar relacionado con 
   * muchos clientes.
   * 
   * @property {Client[]} clients - Lista de clientes asociados a este estado económico.
   */
  @OneToMany(() => Client, (client) => client.economicStatus)
  clients: Client[];
}
