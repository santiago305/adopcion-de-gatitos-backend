import { 
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { status } from 'src/common/constants';

/**
 * Servicio para gestionar la lógica de negocio relacionada con los clientes.
 */
@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crea un nuevo cliente.
   * 
   * @param {CreateClientDto} dto - Los datos necesarios para crear un cliente.
   * @param {Object} user - Información del usuario que realiza la operación.
   * @param {number} user.userId - ID del usuario que realiza la operación.
   * @param {string} user.role - Rol del usuario (debe ser 'USER' para crear clientes).
   * @returns {Promise<Client>} El cliente recién creado.
   * @throws {BadRequestException} Si ya existe un cliente asociado al usuario o si el rol del usuario no es válido.
   */
  async create(dto: CreateClientDto, user: { userId: string }) {
    try {
      const existing = await this.findExistUser(user.userId)
      
      if ((existing as { type: status; message: string }).type) {
        return existing
      }

      const userEntity = await this.userRepository.findOneBy({ id: user.userId });
      if (!userEntity) {
        throw new BadRequestException('tu usuario no fue encontrado encontrado');
      }
    
      await this.clientRepository
          .createQueryBuilder()
          .insert()
          .into('client')
          .values({
            phone: dto.phone,
            birth_date: dto.birth_date,
            gender: dto.gender,
            user: { id: user.userId },
          })
          .execute();
      return {
        type: status.SUCCESS,
        message: 'todo salio perfecto'
      }
      
    } catch {
      return {
        type: status.ERROR,
        message: 'problemas al momento de crear'
      }
    }
  }

  /**
   * Obtiene todos los clientes del sistema.
   * 
   * Este método es crucial para obtener la lista completa de clientes registrados en el sistema. 
   * Solo se consideran aquellos que no están marcados como eliminados (deleted: false). Además, se 
   * recuperan los datos básicos del cliente, incluyendo la relación con el usuario y el estado económico. 
   * 
   * La información retornada es procesada y mapeada a un formato adecuado para ser visualizada de forma eficiente 
   * en interfaces administrativas o para APIs de terceros.
   * 
   * **Optimización de Consultas**: Este método utiliza `createQueryBuilder` para realizar una consulta optimizada 
   * que solo selecciona los campos necesarios (id, dirección, teléfono, estado económico, etc.), lo que mejora el rendimiento 
   * al evitar la carga de datos innecesarios.
   * 
   * @returns {Promise<Client[]>} Lista de todos los clientes activos en el sistema.
   * 
   * @example
   * [{
   *   id: 1,
   *   name: 'Juan Pérez',
   *   email: 'juan.perez@example.com',
   *   address: '123 Calle Ficticia, Lima',
   *   phone: '+51 912 345 678',
   *   economicStatus: 'Bajo',
   *   role: 'USER',
   *   deleted: false
   * }]
   */
  async findAll() {
    return await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.user', 'user')
      .leftJoin('user.role', 'role')
      .select([
        'client.id',
        'user.name',
        'user.email',
        'client.phone',
        'client.birth_date',
        'Client.gender',
        'role.description',
        'client.deleted',
      ])
      .where('client.deleted = :deleted', { deleted: false })
      .getRawMany();
  }

  /**
   * Obtiene todos los clientes activos (no eliminados).
   * 
   * @returns {Promise<Client[]>} Una lista de clientes activos.
   */
  async findActives() {
    return await this.clientRepository.
    createQueryBuilder('client')
      .leftJoin('client.user', 'user')
      .leftJoin('user.role', 'role')
      .select([
        'client.id',
        'user.name',
        'user.email',
        'client.phone',
        'client.birth_date',
        'Client.gender',
        'role.description',
        'client.deleted',
      ])
      .getRawMany();
  }

  /**
   * Obtiene un cliente por su ID.
   * 
   * @param {number} id - El ID del cliente a buscar.
   * @returns {Promise<Client>} El cliente correspondiente al ID.
   * @throws {NotFoundException} Si no se encuentra el cliente.
   */
  async findOne(id: string) {
    const client = await this.clientRepository
    .createQueryBuilder('client')
    .leftJoin('client.user', 'user')
    .select([
      'client.id',
      'user.name',
      'user.email',
      'client.phone',
      'client.birth_date',
      'Client.gender',
    ])
    .where('client.deleted = :deleted', { deleted: false })
    .andWhere('client.id = :id', { id })
    .getOne();

    if (!client) return{
          type: status.ERROR,
          message: 'cliente no encontrada',
    };
    return client;
  }

  async findOwnClient(userId: string) {
    const client = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.user', 'user')
      .select([
        'client.id',
        'user.name',
        'user.email',
        'client.phone',
        'client.birth_date',
        'client.gender',
      ])
      .where('client.deleted = false')
      .andWhere('user.id = :userId', { userId })
      .getOne();
  
    if (!client) {
      return {
        type: status.ERROR,
        message: 'No te hemos encontrado',
      };
    }
  
    return client
  }
  

  /**
   * Obtiene el cliente asociado a un usuario.
   * 
   * @param {number} userId - El ID del usuario para obtener su cliente.
   * @returns {Promise<Client>} El cliente asociado al usuario.
   * @throws {NotFoundException} Si no se encuentra el cliente del usuario.
   */
  async findExistClient(id: string) {
    const exist = await this.clientRepository
    .createQueryBuilder('client')
    .where('client.id = :id', { id })
    .andWhere('client.deleted = false')
    .getExists();

    if (!exist) return{type:status.ERROR, message: 'No te hemos encontrado'}
  }

  async findNotExistClient(id: string) {
    const notExist = await this.clientRepository
    .createQueryBuilder('client')
    .where('client.id = :id', { id })
    .andWhere('client.deleted = true')
    .getExists();

    if (!notExist) return{type:status.WARNING, message: 'este usuario no ha sido eliminado'}
  }

  async findExistUser( userId: string) {
    const exist = await this.clientRepository
    .createQueryBuilder('client')
    .innerJoin('client.user', 'user')
    .where('user.id = :userId', { userId })
    .andWhere('client.deleted = false')
    .getExists();

    if (!exist) return{type:status.WARNING, message: 'Ya existes'}
  }

  /**
   * Actualiza un cliente existente.
   * 
   * @param {number} id - El ID del cliente a actualizar.
   * @param {UpdateClientDto} dto - Los nuevos datos del cliente.
   * @param {Object} user - Información del usuario que realiza la operación.
   * @param {number} user.userId - ID del usuario que realiza la operación.
   * @param {string} user.role - Rol del usuario (solo admin/moderador puede cambiar estado económico).
   * @returns {Promise<Client>} El cliente actualizado.
   * @throws {NotFoundException} Si el cliente no existe o está eliminado.
   * @throws {ForbiddenException} Si el usuario no tiene permiso para actualizar el cliente.
   * @throws {BadRequestException} Si el estado económico seleccionado no es válido.
   */
  async update(id: string, dto: UpdateClientDto) {
    const exist = await this.findExistClient(id);

    if ((exist as {type: status; message: string}).type) {
      return exist
    }

    try {
      await this.clientRepository
        .createQueryBuilder()
        .update('client')
        .set({
          phone: dto.phone,
          birth_date: dto.birth_date,
          gender: dto.gender,
        })
        .where('client.id = :id', { id })
        .andWhere('client.deleted = false')
        .execute();
  
      return {
        type: status.SUCCESS,
        message: 'Cliente actualizado correctamente',
      };
    } catch  {
      return {
        type: status.ERROR,
        message: 'Hubo un error al actualizar el cliente',
      };
    }

  }

  /**
   * Elimina un cliente.
   * 
   * @param {number} id - El ID del cliente a eliminar.
   * @returns {Promise<Client>} El cliente eliminado.
   */
  async remove(id: string, userId: string) {
    const clientExist = await this.findExistClient(id)
    if((clientExist as {type:status; message:string}).type){
      return clientExist
    }
    try {
      await this.clientRepository.manager.transaction(async (transactionalEntityManager) => {

        const clientRemove = await transactionalEntityManager
        .createQueryBuilder()
        .update('client')
        .set({ deleted: true })
        .where('id = :id', { id })
        .andWhere('client.deleted = false')
        .execute();

        if (clientRemove.affected === 0) {
          return{
            type: status.ERROR,
            message: 'no hemos podido eliminarte'
          }
        }

        const userRemove = await this.userRepository.remove(userId)
        if ((userRemove as {type:status; message: string}).type){
          return userRemove
        }
      })

    return {
      type: status.SUCCESS,
      message: 'has sido elimado desactivados correctamente',
    }
      
    } catch  {
      return {
        type: status.ERROR,
        mesage: 'A ocurrido un error al eliminarte'
      }
    }
  }

  /**
   * Restaura un cliente eliminado.
   * 
   * @param {number} id - El ID del cliente a restaurar.
   * @returns {Promise<Client>} El cliente restaurado.
   */
  async restore(id: string, userId: string) {
    const clientNotExist = await this.findNotExistClient(id)
    if((clientNotExist as {type:status; message:string}).type){
      return clientNotExist
    }
    try {
      await this.clientRepository.manager.transaction(async (transactionalEntityManager) => {

        const clientRestore = await transactionalEntityManager
        .createQueryBuilder()
        .update('client')
        .set({ deleted: false })
        .where('id = :id', { id })
        .andWhere('client.deleted = false')
        .execute();

        if (clientRestore .affected === 0) {
          return{
            type: status.ERROR,
            message: 'no hemos podido restaurar al cliente'
          }
        }

        const userRestore = await this.userRepository.restore(userId)
        if ((userRestore as {type:status; message: string}).type){
          return userRestore
        }
      })

    return {
      type: status.SUCCESS,
      message: 'has sido elimado desactivados correctamente',
    }
      
    } catch  {
      return {
        type: status.ERROR,
        mesage: 'A ocurrido un error al eliminarte'
      }
    }
  }
}
