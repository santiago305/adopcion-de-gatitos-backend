import { 
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { UsersService } from 'src/users/users.service';
import { isErrorResponse } from 'src/common/guards/guard';
import { ErrorResponse, SuccessResponse } from 'src/common/interfaces/response.interface';
import { errorResponse, successResponse } from 'src/common/utils/response';
import { RoleType } from 'src/common/constants';

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

    private readonly userService: UsersService,
  ) {}

  async create(dto: CreateClientDto & { userId?: string }, currentUser: { userId: string }) {
    const requester = await this.userService.findOne(currentUser.userId);
    if (isErrorResponse(requester)) {
      throw new BadRequestException(requester.message);
    }

    // Si el solicitante es USER, solo puede crearse a sí mismo
    if (requester.data.rol === RoleType.USER) {
      await this.userService.isUserActive(currentUser.userId);
      await this.userService.findOwnUser(currentUser.userId);

      const exists = await this.isClientExist(currentUser.userId);
      if (exists) throw new BadRequestException('Ya tienes un cliente registrado');

      await this.clientRepository
        .createQueryBuilder()
        .insert()
        .into(Client)
        .values({
          phone: dto.phone,
          birth_date: dto.birth_date,
          gender: dto.gender,
          user: { id: currentUser.userId },
        })
        .execute();

      return successResponse('Cliente creado exitosamente');
    }

    // Si el solicitante es ADMIN o MODERATOR, debe pasar el userId de un USER válido
    if (!dto.userId) {
      throw new BadRequestException('Debes proporcionar el ID del usuario para asignar el cliente');
    }

    const targetUser = await this.userService.findOne(dto.userId);
    if (isErrorResponse(targetUser)) {
      throw new BadRequestException(targetUser.message);
    }
    if (targetUser.data.rol !== RoleType.USER) {
      throw new UnauthorizedException('Solo se puede asignar un cliente a un usuario con rol USER');
    }

    const alreadyExists = await this.isClientExist(dto.userId);
    if (alreadyExists) throw new BadRequestException('Este usuario ya tiene un cliente asociado');

    await this.clientRepository
      .createQueryBuilder()
      .insert()
      .into(Client)
      .values({
        phone: dto.phone,
        birth_date: dto.birth_date,
        gender: dto.gender,
        user: { id: dto.userId },
      })
      .execute();

    // Personalizar mensaje con rol y nombre del requester
    const roleName = requester.data.rol === RoleType.ADMIN ? 'administrador' : 'moderador';
    const message = `Cliente creado correctamente por el ${roleName} ${requester.data.user_name || ''}`.trim();

    return successResponse(message);
  }

  private async getClients(
  whereClause?: string,
  page: number = 1,
  filters?: { gender?: string },
  sortBy: string = 'client.createdAt',
  order: 'ASC' | 'DESC' = 'DESC'
) {
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const query = this.clientRepository
    .createQueryBuilder('client')
    .leftJoin('client.user', 'user')
    .leftJoin('user.role', 'role')
    .select([
      'client.id',
      'user.name AS name',
      'user.email AS email',
      'client.phone',
      'client.birth_date',
      'client.gender',
      'client.deleted',
    ])
    .skip(offset)
    .take(pageSize);

  if (whereClause) {
    query.where(whereClause);
  } else {
    query.where('1=1');
  }

  if (filters?.gender) {
    query.andWhere('client.gender = :gender', { gender: filters.gender });
  }

  query.orderBy(sortBy, order);

  return query.getRawMany();
}
  async findAll(params: {
    page?: number,
    filters?: { gender?: string },
    sortBy?: string,
    order?: 'ASC' | 'DESC'
  }) {
    return this.getClients(undefined, params.page, params.filters, params.sortBy, params.order);
  }

  async findActives(params: {
    page?: number,
    filters?: { gender?: string },
    sortBy?: string,
    order?: 'ASC' | 'DESC'
  }){
    return await this.getClients('role.deleted = false', params.page, params.filters, params.sortBy, params.order)
  }

  private async getClientData(
    where: 'userId' | 'clientId',
    value: string
  ): Promise<SuccessResponse | ErrorResponse> {
    const query = this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.user', 'user')
      .select([
        'client.id AS id',
        'user.name AS name',
        'user.email AS email',
        'client.phone AS phone',
        'client.birth_date AS birth_date',
        'client.gender AS gender',
      ])
      .where('client.deleted = :deleted', { deleted: false });

    if (where === 'userId') {
      query.andWhere('client.user_id = :value', { value });
    } else {
      query.andWhere('client.id = :value', { value });
    }

    const client = await query.getRawOne();

    if (!client) return errorResponse('Cliente no encontrado');

    return successResponse('Cliente encontrado', client);
  }

  async findOne(user: { userId: string }): Promise<SuccessResponse | ErrorResponse> {
    return this.getClientData('userId', user.userId);
  }

  async findByClientId(clientId: string): Promise<SuccessResponse | ErrorResponse> {
    return this.getClientData('clientId', clientId);
  }

  private async checkClientStatus(
    userId: {userId:string}, 
    deleted: boolean, 
    errorMsg: string, 
    checkDelete: boolean = true
  ){
    const query = this.clientRepository
    .createQueryBuilder('client')
    .leftJoin('client.user', 'user')
    .where('user_id = :userId', {userId})
    if(checkDelete){
      query.andWhere('client.deleted = :deleted', { deleted })
    }
    const exists = await query.getExists();
    if (!exists) return errorResponse(errorMsg)
    return true
  }

  async isClientActive(user: { userId: string }) {
    return await this.checkClientStatus({ userId: user.userId }, false, 'Este cliente no existe')
  }

  async isClientDelete(user: { userId: string }) {
    return await this.checkClientStatus({ userId: user.userId }, true, 'Este cliente no ha sido eliminado')
  }

  async isClientExist( userId: string ): Promise<boolean> {
  const exists = await this.clientRepository
    .createQueryBuilder('client')
    .leftJoin('client.user', 'user')
    .where('user.id = :userId', { userId })
    .getExists();
  return exists; 
}

// FUTURO:
// En caso se agregue un campo booleano como `canBeEditedByAdmin` en la entidad Client,
// se debe incluir una validación antes de permitir la modificación por parte de roles ADMIN o MODERATOR.
// Ejemplo:
// const client = await this.clientRepository.findOne({ where: { id: clientId } });
// if (!client.canBeEditedByAdmin) return errorResponse('No se permite modificar este cliente');

  private async updateClient(
    condition: { type: 'userId' | 'clientId'; value: string },
    dto: UpdateClientDto
  ): Promise<SuccessResponse | ErrorResponse> {
    // Validar si el cliente existe y no está eliminado
    const exists = await this.clientRepository
      .createQueryBuilder('client')
      .where(`${condition.type === 'userId' ? 'user_id' : 'id'} = :value`, {
        value: condition.value,
      })
      .andWhere('client.deleted = false')
      .getExists();

    if (!exists) return errorResponse('Cliente no existe o ha sido eliminado');

    try {
      await this.clientRepository
        .createQueryBuilder()
        .update(Client)
        .set({
          phone: dto.phone,
          birth_date: dto.birth_date,
          gender: dto.gender,
        })
        .where(`${condition.type === 'userId' ? 'user_id' : 'id'} = :value`, {
          value: condition.value,
        })
        .andWhere('deleted = false')
        .execute();

      // Reutilizar getClientData con el mismo tipo y valor
      const ClientUpdate = await this.getClientData(condition.type, condition.value);
      if (isErrorResponse(ClientUpdate)) {
        return errorResponse('Error al obtener los datos del cliente actualizado');
      }
      return successResponse('Cliente actualizado correctamente', ClientUpdate.data);
    } catch (error) {
      console.error('[ClientsService][updateClient] Error al actualizar:', error);
      return errorResponse('Hubo un error al actualizar el cliente');
    }
  }

  // Usuario actualiza su propio cliente
  async updateOwn(user: { userId: string }, dto: UpdateClientDto): Promise<SuccessResponse | ErrorResponse> {
    return this.updateClient({ type: 'userId', value: user.userId }, dto);
  }

  // Admin o moderador actualiza por id de cliente
  async updateByClientId(clientId: string, dto: UpdateClientDto): Promise<SuccessResponse | ErrorResponse> {
    return this.updateClient({ type: 'clientId', value: clientId }, dto);
  }

  private async toggleDelete(user: {userId:string}, deleted: boolean, successMsg: string, errorMsg: string):Promise<SuccessResponse | ErrorResponse> {
    try {
      await this.userRepository
        .createQueryBuilder()
        .update(Client)
        .set({ deleted })
        .where('user_id = :userId', { userId: user.userId })
        .execute();
  
      return successResponse(successMsg);
    } catch (error) {
      console.error('[ClientService][toggleDelete] error de la accion', error);
      
      return errorResponse(errorMsg);
    }
  }
  async remove(user: {userId:string}) {
    const isActive = await this.isClientActive({ userId: user.userId })
    if(isErrorResponse(isActive))return isActive;

    return await this.toggleDelete({ userId: user.userId }, true, 'El cliente se ha eliminado correctamente', 'no se pudo eliminar el cliente')
  }

  async restore(user: {userId:string}) {
    const isDelete = await this.isClientActive({ userId: user.userId })
    if(isErrorResponse(isDelete))return isDelete;

    return await this.toggleDelete({ userId: user.userId }, false, 'El cliente se ha restaurado correctamente', 'no se pudo restaurar el cliente')
  }
}
