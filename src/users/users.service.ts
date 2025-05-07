import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';
import { RoleType } from 'src/common/constants';
import { errorResponse, successResponse } from 'src/common/utils/response';
import { ErrorResponse, SuccessResponse } from 'src/common/interfaces/response.interface';
import { isErrorResponse } from 'src/common/guards/guard';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly rolesService: RolesService,
  ) {}

  private async getUsers(whereClause?: string) {
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'role.description',
        'user.deleted',
      ]);
    
    if (whereClause) query.where(whereClause);
  
    return query.getRawMany();
  }
  
  async findAll() {
    return await this.getUsers()
  }

  async findActives() {
    return await this.getUsers('role.deleted = false')
  }

  async findOne(id: string):Promise<SuccessResponse | ErrorResponse> {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .leftJoin('user.role', 'role')
    .where('user.deleted = :deleted', { deleted: false })
    .andWhere('user.id = :id', { id })
    .getOne();
    
    if(!user) return errorResponse('No hemos podido encotrar el usuario');

    return successResponse('usuarios encontrado', user)
  }
  private async checkUserStatus(
    idOrEmail: string, 
    deleted: boolean = false, 
    errorMsg: string, 
    useEmail:boolean = false,
    checkDelete: boolean = true
    ){
    const query = this.userRepository
    .createQueryBuilder('user')

    if(checkDelete){
      query.andWhere('user.deleted = :deleted', { deleted })
    }
    if (useEmail) {
      query.andWhere('user.email = :email', { email: idOrEmail });
    } else {
      query.andWhere('user.id = :id', { id: idOrEmail });
    }
  
    const exists = await query.getExists();

    if (!exists) return errorResponse(errorMsg)

    return true
  }
  async isUserActive(id: string) {
    return await this.checkUserStatus(id, false, 'El usuario ingresado no existe')
  }
  async isUserDeleted(id: string) {
    return await this.checkUserStatus(id, true, 'Este usuario todavia no ha sido eliminado')
  }

  async isUserEmail(email: string) {
    return await this.checkUserStatus(email, false, 'Este usuario ya existe', true, false)
  }
  async findByEmail(email: string): Promise<SuccessResponse | ErrorResponse> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.email',
        'user.password'
      ])
      .where('user.email = :email', { email })
      .andWhere('user.deleted = false')
      .getOne();
  
    if (!user) return errorResponse('No hemos encontrado el usuario');

    return successResponse('Usuario encontrado', user);
  }
  async findOwnUser(userId: string): Promise<SuccessResponse | ErrorResponse> {
    const user = await this.findOne(userId);
    return user;
  }

  async create(dto: CreateUserDto, requesterRole: string):Promise<SuccessResponse | ErrorResponse> {
    const existing = await this.isUserEmail(dto.email);
  
    if (isErrorResponse(existing))return existing;
  
    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    
    const isAdmin = requesterRole === RoleType.ADMIN;

    const targetRoleType = isAdmin ? dto.roleId ?? RoleType.USER : RoleType.USER;
  
    const role = await this.rolesService.findOneDescription(targetRoleType)
    if (isErrorResponse(role)) return role;
  
    try {
      await this.userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: { id: role.data.id }
        })
        .execute();
    
      return successResponse('Usuario creado correctamente') 
    } catch (error) {
      console.error('[UsersService][create] error al crear un usuario: ',error);
      return errorResponse('Se a producido un error al crear al usuario')  
    }
  }
  
  async update(id: string, dto: UpdateUserDto):Promise <SuccessResponse | ErrorResponse> {
    const user = await this.findOne(id)
    if (isErrorResponse(user)) return user;

    const updateData: Partial<User> = {};
    if (dto.email) {
      const existing = await this.isUserEmail(dto.email);
      if(isErrorResponse(existing)) return existing;
      updateData.email = dto.email;
    }

    if (dto.name) updateData.name = dto.name;
    if (dto.email) updateData.email = dto.email;
    if (dto.password) {
      updateData.password = await argon2.hash(dto.password, {
        type: argon2.argon2id,
      });
    }

    try {

      await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set(updateData)
      .where('id = :id',{id})
      .execute();

      const updateUser = await this.findOne(id)

      return successResponse('Modificacion terminada', updateUser)
    } catch (error) {
      console.error('[UserService][update] error al editar el usuario: ', error);
      return errorResponse('No pudimos modificar el usuario')
      
    }
  }

  
  private async toggleDelete(id: string, deleted: boolean, successMsg: string, errorMsg: string):Promise<SuccessResponse | ErrorResponse> {
      try {
        await this.userRepository
          .createQueryBuilder()
          .update(User)
          .set({ deleted })
          .where('id = :id', { id })
          .execute();
    
        return successResponse(successMsg);
      } catch (error) {
        console.error('[UserService][toggleDelete] error de la accion', error);
        
        return errorResponse(errorMsg);
      }
    }
  async remove(id: string) {
    const isActive = await this.isUserActive(id);
    if (isErrorResponse(isActive)) return isActive; 
    return this.toggleDelete(id, true, 'El usuario ha sido eliminado','no se pudo eliminar al usuario')
  }

  /**
   * Restaura un usuario previamente eliminado.
   * @param id ID del usuario
   * @throws NotFoundException si el usuario no existe
   * @returns Usuario restaurado
   */
  async restore(id: string ) {
    const isDeleted = await this.isUserDeleted(id)
    if (isErrorResponse(isDeleted)) return isDeleted; 
    return this.toggleDelete(id, false, 'El usuario ha sido restaurado','No se pudo restaurar al usuario')
  }
}
