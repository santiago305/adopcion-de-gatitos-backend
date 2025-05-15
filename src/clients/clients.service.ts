import { 
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
import { isTypeResponse } from 'src/common/guards/guard';
import { ErrorResponse, SuccessResponse } from 'src/common/interfaces/response.interface';
import { errorResponse, successResponse } from 'src/common/utils/response';

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

  async create(dto: CreateClientDto, user: { userId: string }) {
      await this.userService.isUserActive(user.userId)

      await this.userService.findOwnUser(user.userId);

      try {
        await this.clientRepository
          .createQueryBuilder()
          .insert()
          .into(Client)
          .values({
            phone: dto.phone,
            birth_date: dto.birth_date,
            gender: dto.gender,
            user: { id: user.userId },
          })
          .execute();

          return successResponse('Todo salio perfecto en tu registro')

      } catch (error) {
        console.error('[ClientsService][create] error al crear un cliente: ', error);
        throw new UnauthorizedException('Error inesperado al crear el cliente')
        
      }

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
  
    const query = this.userRepository
      .createQueryBuilder('client')
      .leftJoin('client.user', 'user')
      .select([
        'client.id',
        'user.name AS name',
        'user.email As email',
        'client.phone',
        'client.birth_date',
        'client.gender',
        'client.deleted',
      ])
      .skip(offset)
      .take(pageSize);
  
    // Aplica condiciones en orden seguro
    if (whereClause) {
      query.where(whereClause);
    } else {
      query.where('1=1'); // para permitir encadenar andWhere incluso si no hay filtro base
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
    if(isTypeResponse(existing)) return existing;

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
    if(isTypeResponse(isActive))return isActive;

    return await this.toggleDelete({ userId: user.userId }, true, 'El cliente se ha eliminado correctamente', 'no se pudo eliminar el cliente')
  }

  async restore(user: {userId:string}) {
    const isDelete = await this.isClientActive({ userId: user.userId })
    if(isTypeResponse(isDelete))return isDelete;

    return await this.toggleDelete({ userId: user.userId }, false, 'El cliente se ha restaurado correctamente', 'no se pudo restaurar el cliente')
  }
}
