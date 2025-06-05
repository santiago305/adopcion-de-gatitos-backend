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
    if (isErrorResponse(requester)) throw new BadRequestException(requester.message);
    

    // Si el solicitante es USER, solo puede crearse a sí mismo
    if (requester.data.rol === RoleType.USER) {
      await this.userService.isUserActive(currentUser.userId);
      await this.userService.findOwnUser(currentUser.userId);

      const target = { type: 'userId' as 'userId' | 'clientId', value: currentUser.userId }
      const exists = await this.isClientExist(target);
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
    if (isErrorResponse(targetUser)) throw new BadRequestException(targetUser.message);
    
    if (targetUser.data.rol !== RoleType.USER) {
      throw new UnauthorizedException('Solo se puede asignar un cliente a un usuario con rol USER');
    }
    const target = { type: 'userId' as 'userId' | 'clientId', value: dto.userId }
    const alreadyExists = await this.isClientExist(target);
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

    if (!client) throw new BadRequestException('Cliente no encontrado');

    return successResponse('Cliente encontrado', client);
  }

  async findOne(user: { userId: string }): Promise<SuccessResponse | ErrorResponse> {
    return this.getClientData('userId', user.userId);
  }

  async findByClientId(clientId: string): Promise<SuccessResponse | ErrorResponse> {
    return this.getClientData('clientId', clientId);
  }

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
      if (isErrorResponse(ClientUpdate)) return errorResponse('Error al obtener los datos del cliente actualizado');
    
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

  private async checkClientStatus(
    target: { type: 'userId' | 'clientId'; value: string },
    deleted: boolean,
    errorMsg: string,
  ): Promise<true | ErrorResponse> {
    const query = this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.user', 'user')
      .where('client.deleted = :deleted', { deleted }); // Aquí se mantiene la condición de deleted

    // Ahora utilizamos `andWhere()` para añadir más condiciones
    if (target.type === 'userId') {
      query.andWhere('client.user_id = :value', { value: target.value }); // Condición para userId
    } else {
      query.andWhere('client.id = :value', { value: target.value }); // Condición para clientId
    }

    const exists = await query.getExists();
    if (!exists) return errorResponse(errorMsg);
    return true;
  }


  async isClientActive(target: { type: 'userId' | 'clientId'; value: string }) {
    return await this.checkClientStatus(target, false, 'Este cliente no existe');
  }

  async isClientDeleted(target: { type: 'userId' | 'clientId'; value: string }) {
    return await this.checkClientStatus(target, true, 'Este cliente no ha sido eliminado');
  }

  async isClientExist(target: { type: 'userId' | 'clientId'; value: string }): Promise<boolean> {
    const query = this.clientRepository
      .createQueryBuilder('client')
      .leftJoin('client.user', 'user'); // Unimos la tabla 'user' para obtener el 'userId' si es necesario

    // Dependiendo del tipo de ID, buscamos ya sea por 'userId' o por 'clientId'
    if (target.type === 'userId') {
      query.where('user.id = :value', { value: target.value });
    } else if (target.type === 'clientId') {
      query.where('client.id = :value', { value: target.value });
    }

    const exists = await query.getExists();
    return exists;
  }

// FUTURO:
// En caso se agregue un campo booleano como `canBeEditedByAdmin` en la entidad Client,
// se debe incluir una validación antes de permitir la modificación por parte de roles ADMIN o MODERATOR.
// Ejemplo:
// const client = await this.clientRepository.findOne({ where: { id: clientId } });
// if (!client.canBeEditedByAdmin) return errorResponse('No se permite modificar este cliente');


private async toggleDelete(
  user: { userId: string }, // Datos del usuario logueado
  target: { type: 'userId' | 'clientId'; value: string }, // Identificador de cliente o usuario
  deleted: boolean // Si se debe eliminar o restaurar
): Promise<SuccessResponse | ErrorResponse> {
  const requester = await this.userService.findOne(user.userId);
  if (isErrorResponse(requester)) throw new BadRequestException(requester.message);

  // Verificar si el cliente existe
  const clientExisting = await this.isClientExist(target);
  if (!clientExisting) throw new BadRequestException('No hay registro de este cliente');

  // Si el solicitante es un usuario (ROLE_USER), solo podrá eliminar o restaurar su propio cliente
  if (requester.data.rol === RoleType.USER) {
    if (target.type === 'clientId' && target.value !== user.userId) {
      // Un usuario no puede eliminar o restaurar el cliente de otra persona
      throw new UnauthorizedException('No tienes permisos para eliminar o restaurar este cliente');
    }

    // Verificar el estado del cliente (activo o eliminado)
    const clientStatus = await this.isClientActive({ type: 'userId', value: user.userId });
    if (isErrorResponse(clientStatus)) return clientStatus;

    // Realizar la eliminación/restauración
    try {
      await this.clientRepository
        .createQueryBuilder()
        .update(Client)
        .set({ deleted })
        .where('user_id = :value', { value: user.userId })
        .execute();

      // Eliminar el usuario asociado si es necesario
      if (deleted) {
        const userDelete = await this.userService.remove(user.userId);
        if (isErrorResponse(userDelete)) return userDelete;
      }

      const action = deleted ? 'eliminado' : 'restaurado';
      return successResponse(`Has ${action} tu cuenta correctamente`);
    } catch (error) {
      console.error('[ClientsService][toggleDelete] Error:', error);
      throw new BadRequestException('Hubo un error al procesar la solicitud');
    }
  }

  // Si el solicitante es ADMIN o MODERATOR, puede eliminar o restaurar cualquier cliente
  if ([RoleType.ADMIN, RoleType.MODERATOR].includes(requester.data.rol)) {
    // Verificamos si el cliente está activo o eliminado
    const clientDeleteStatus = await this.isClientDeleted(target);
    if (isErrorResponse(clientDeleteStatus)) throw new BadRequestException(clientDeleteStatus.message);

    try {
      const client = await this.clientRepository
        .createQueryBuilder('client')
        .leftJoin('client.user', 'user')
        .select(['user.name AS name', 'client.user_id AS userId'])
        .where('client.id = :id', { id: target.value })
        .getRawOne();

      // Actualizamos el estado de eliminado del cliente
      await this.clientRepository
        .createQueryBuilder()
        .update(Client)
        .set({ deleted })
        .where('id = :id', { id: target.value })
        .execute();

      // Restaurar o eliminar el usuario asociado según corresponda
      if (deleted) {
        const userDelete = await this.userService.remove(client.userId);
        if (isErrorResponse(userDelete)) return userDelete;
      } else {
        const userRestore = await this.userService.restore(client.userId);
        if (isErrorResponse(userRestore)) return userRestore;
      }

      const action = deleted ? 'eliminado' : 'restaurado';
      return successResponse(`El cliente ${client.name} ha sido ${action} correctamente`);
    } catch (error) {
      console.error('[ClientsService][toggleDelete] Error:', error);
      throw new BadRequestException('Hubo un error al procesar la solicitud');
    }
  }

  throw new UnauthorizedException('No tienes permisos para realizar esta acción');
}




  async remove(user: { userId: string }, clientId?: string): Promise<SuccessResponse | ErrorResponse> {
    // Si es un usuario, solo puede eliminar su propio cliente
    const target = { type: 'userId' as 'userId' | 'clientId', value: clientId ? clientId : user.userId };
    
    // Llamamos a la función toggleDelete para eliminar la cuenta
    return this.toggleDelete(user, target, true); // `true` indica que se va a eliminar
  }

  async restore(user: { userId: string }, clientId: string): Promise<SuccessResponse | ErrorResponse> {
    // Llamamos a la función toggleDelete para restaurar la cuenta
    return this.toggleDelete(user, { type: 'clientId' as 'userId' | 'clientId', value: clientId }, false); // `false` indica que se va a restaurar
  }


  // private async toggleDelete(
  //   deleter: { userId: string; rol: RoleType; user_name: string },
  //   target: { type: 'userId' | 'clientId'; value: string },
  //   deleted: boolean
  // ): Promise<SuccessResponse | ErrorResponse> {
  //   // Validar existencia del cliente
  //   const statusCheck = await this.checkClientStatus(target, !deleted, deleted
  //     ? 'El cliente no se encuentra o ya está eliminado'
  //     : 'El cliente no se encuentra o ya está activo');

  //   if (isErrorResponse(statusCheck)) return statusCheck;

  //   try {
  //     await this.clientRepository
  //       .createQueryBuilder()
  //       .update(Client)
  //       .set({ deleted })
  //       .where(`${target.type === 'userId' ? 'user_id' : 'id'} = :value`, { value: target.value })
  //       .execute();

  //     // Obtener información del cliente afectado
  //     const client = await this.getClientData(target.type, target.value);
  //     if (isErrorResponse(client)) return client;

  //     // Construir mensaje
  //     const clientName = client.data.name;
  //     let message = '';

  //     if (deleter.rol === RoleType.USER) {
  //       message = deleted
  //         ? 'Hemos eliminado tu cuenta correctamente'
  //         : 'Hemos restaurado tu cuenta correctamente';
  //     } else {
  //       const roleLabel = deleter.rol === RoleType.ADMIN ? 'Administrador' : 'Moderador';
  //       message = deleted
  //         ? `${roleLabel} ${deleter.user_name} eliminó al cliente ${clientName}`
  //         : `${roleLabel} ${deleter.user_name} restauró al cliente ${clientName}`;
  //     }

  //     return successResponse(message);
  //   } catch (error) {
  //     console.error('[ClientsService][toggleDeleteFlexible] Error:', error);
  //     return errorResponse('Hubo un error al procesar la solicitud');
  //   }
  // }

  // async remove(currentUser: { userId: string; rol: RoleType; user_name: string }, clientId?: string) {

  //   const target: { type: 'userId' | 'clientId'; value: string } = currentUser.rol === RoleType.USER
  //   ? { type: 'userId', value: currentUser.userId }
  //   : { type: 'clientId', value: clientId! };


  //   return this.toggleDelete(currentUser, target, true);
  // }

  // async restore(currentUser: { userId: string; rol: RoleType; user_name: string }, clientId: string) {
  //   if (currentUser.rol === RoleType.USER) {
  //     return errorResponse('No tienes permisos para restaurar clientes');
  //   }

  //   return this.toggleDelete(currentUser, { type: 'clientId', value: clientId }, false);
  // }

}
