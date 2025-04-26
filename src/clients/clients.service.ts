import { 
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import { EconomicStatus } from 'src/economic_status/entities/economic_status.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { RoleType } from 'src/common/constants';
import { mapClient, mapClientList, mapClientListRaw } from './utils/clients.mapper';
import { ForbiddenException } from '@nestjs/common';

/**
 * Servicio para gestionar la lógica de negocio relacionada con los clientes.
 */
@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(EconomicStatus)
    private readonly economicStatusRepository: Repository<EconomicStatus>,

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
  async create(dto: CreateClientDto, user: { userId: number; role: string }) {
    const existing = await this.clientRepository.findOne({
      where: { user: { id: user.userId } },
    });
  
    if (existing) {
      throw new BadRequestException('El cliente ya existe');
    }
  
    if (user.role !== RoleType.USER) {
      throw new BadRequestException('Solo los usuarios pueden crear clientes');
    }
  
    const economicStatus = await this.economicStatusRepository.findOneBy({ id: 1 });
    if (!economicStatus) {
      throw new BadRequestException('Estado económico por defecto (id=1) no encontrado');
    }
  
    const userEntity = await this.userRepository.findOneBy({ id: user.userId });
    if (!userEntity) {
      throw new BadRequestException('Usuario no encontrado');
    }
  
    const client = this.clientRepository.create({
      address: dto.address,
      phone: dto.phone,
      user: userEntity,
      economicStatus,
    });
  
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
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
    const clients = await this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.user', 'user')
      .leftJoin('user.role', 'role')
      .leftJoin('client.economicStatus', 'economicStatus')
      .select([
        'client.id',
        'client.address',
        'client.phone',
        'client.deleted',
        'user.name',
        'user.email',
        'role.description',
        'economicStatus.level',
      ])
      .where('client.deleted = :deleted', { deleted: false })
      .getRawMany();
  
    return clients.map(mapClientListRaw);
  }

  /**
   * Obtiene todos los clientes activos (no eliminados).
   * 
   * @returns {Promise<Client[]>} Una lista de clientes activos.
   */
  async findActives() {
    const clients = await this.clientRepository.find({
      where: { deleted: false },
      relations: ['user', 'user.role', 'economicStatus'],
    });
    return clients.map(mapClientList)
  }

  /**
   * Obtiene un cliente por su ID.
   * 
   * @param {number} id - El ID del cliente a buscar.
   * @returns {Promise<Client>} El cliente correspondiente al ID.
   * @throws {NotFoundException} Si no se encuentra el cliente.
   */
  async findOne(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: false },
      relations: ['user', 'user.role', 'economicStatus'],
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    return mapClientList(client);
  }

  /**
   * Obtiene el cliente asociado a un usuario.
   * 
   * @param {number} userId - El ID del usuario para obtener su cliente.
   * @returns {Promise<Client>} El cliente asociado al usuario.
   * @throws {NotFoundException} Si no se encuentra el cliente del usuario.
   */
  async findByUser(userId: number) {
    const client = await this.clientRepository.findOne({
      where: { user: { id: userId }, deleted: false },
      relations: ['user', 'economicStatus'],
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    return mapClient(client);
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
  async update(id: number, dto: UpdateClientDto, user: { userId: number; role: string }) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: false },
      relations: ['user', 'economicStatus'],
    });

    if (!client) {
      throw new NotFoundException('El cliente no existe o está eliminado');
    }

    const isOwner = client.user.id === user.userId;
    const isAdminOrModerator = [RoleType.ADMIN, RoleType.MODERATOR].includes(user.role as RoleType);

    if (isOwner && user.role === RoleType.USER) {
      if (dto.economicStatusId) {
        throw new ForbiddenException('No tienes permiso para modificar el estado económico');
      }

      if (dto.address) client.address = dto.address;
      if (dto.phone) client.phone = dto.phone;
    } 
    else if (isAdminOrModerator) {
      if (dto.economicStatusId) {
        const status = await this.economicStatusRepository.findOneBy({ id: dto.economicStatusId });
        if (!status) {
          throw new BadRequestException('El estado económico seleccionado no es válido');
        }
        client.economicStatus = status;
      }
      if (dto.address) client.address = dto.address;
      if (dto.phone) client.phone = dto.phone;
    }
    else {
      throw new ForbiddenException('No tienes autorización para actualizar este cliente');
    }

    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }

  /**
   * Elimina un cliente.
   * 
   * @param {number} id - El ID del cliente a eliminar.
   * @returns {Promise<Client>} El cliente eliminado.
   */
  async remove(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: false },
      relations: ['user', 'economicStatus'],
    });
    client.deleted = true;
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }

  /**
   * Elimina el cliente asociado a un usuario.
   * 
   * @param {number} userId - El ID del usuario cuyo cliente será eliminado.
   * @returns {Promise<Client>} El cliente eliminado.
   */
  async removeSelf(userId: number) {
    const client = await this.clientRepository.findOne({
      where: { user: { id: userId }, deleted: false },
      relations: ['user', 'economicStatus'],
    });
    client.deleted = true;
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }

  /**
   * Restaura un cliente eliminado.
   * 
   * @param {number} id - El ID del cliente a restaurar.
   * @returns {Promise<Client>} El cliente restaurado.
   */
  async restore(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: true },
      relations: ['user', 'economicStatus'],
    });
    client.deleted = false;
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }
}
