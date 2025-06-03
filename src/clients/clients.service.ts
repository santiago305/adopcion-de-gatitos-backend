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
    if(isErrorResponse(targetUser)){
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

    return successResponse('Cliente creado correctamente por administrador o moderador');
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


  async findOne(user: { userId: string }):Promise <SuccessResponse|ErrorResponse> {
    const client = await this.clientRepository
    .createQueryBuilder('client')
    .leftJoin('client.user', 'user')
    .select([
      'client.id',
      'user.name AS name',
      'user.email AS email',
      'client.phone',
      'client.birth_date',
      'client.gender',
      'client.deleted',
      'client.user_id'
    ])
    .where('client.deleted = :deleted', { deleted: false })
    .andWhere('user_id = :userId', { userId: user.userId }) 
    .getOne();

    if (!client) return errorResponse('cliente no encontrado');

    return successResponse('Cliente encontrado', client)
  }

  async findOwnClient(user: { userId: string }):Promise<SuccessResponse | ErrorResponse> {
    const client = await this.findOne({ userId: user.userId })
    return client
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

  async update(user: {userId:string}, dto: UpdateClientDto):Promise <SuccessResponse | ErrorResponse> {
    const existing = await this.isClientActive({ userId: user.userId });
    if(isErrorResponse(existing)) return existing;

    try {
      await this.clientRepository
        .createQueryBuilder()
        .update('client')
        .set({
          phone: dto.phone,
          birth_date: dto.birth_date,
          gender: dto.gender,
        })
        .where('user_id = :id', { userId: user.userId })
        .andWhere('client.deleted = false')
        .execute();
        
        const updateClient = this.findOwnClient({ userId: user.userId })

      return successResponse('Cliente actualizado correctamente', updateClient)
    } catch (error) {
      console.error('[ClientsService][Update] hubo un problema en la actualizacion: ', error);
      return errorResponse('Hubo un error al actualizar el cliente')
    }

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
