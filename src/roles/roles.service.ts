import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { errorResponse, successResponse } from 'src/common/utils/response';
import { isErrorResponse } from 'src/common/guards/guard';
import { ErrorResponse, SuccessResponse } from 'src/common/interfaces/response.interface';

/**
 * Servicio encargado de la gestión de roles en el sistema.
 *
 * Incluye operaciones CRUD, además de métodos para restaurar o marcar un rol como eliminado (soft delete).
 */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Crea un nuevo rol en la base de datos.
   * 
   * @param dto - Datos necesarios para crear un nuevo rol.
   * @returns El rol recién creado y guardado.
   */
  async create(dto: CreateRoleDto):Promise<SuccessResponse | ErrorResponse> {
    const exists = await this.isRoleExisting(dto.description)
    if (isErrorResponse(exists)) return exists;
    try {
     await this.roleRepository
    .createQueryBuilder()
    .insert()
    .into(Role)
    .values(dto)
    .returning(['id', 'description', 'deleted'])
    .execute();

    return successResponse('Rol creado exitosamente')
    
    } catch (error) {
        console.error('[RolesService][create] error al crear el rol: ', error)
        return errorResponse('No hemos podido crear el rol')
    }

  
  }

  /**
   * Obtiene todos los roles registrados.
   * 
   * @returns Lista completa de roles.
   * @throws Error si no se encuentran roles.
   * pnpm run seed guarda datos predeterminados
   */

  private async getRoles(whereClause?: string) {
    const query = this.roleRepository
      .createQueryBuilder('role')
      .select([
        'role.id',
        'role.description',
        'role.deleted',
      ]);
    
    if (whereClause) query.where(whereClause);
  
    return query.getRawMany();
  }
  async findAll() {
      return await this.getRoles()
  }
    
  /**
   * Obtiene todos los roles que no están marcados como eliminados.
   *
   * @returns Lista de roles activos junto con sus relaciones (por ejemplo, usuarios).
   */
  async findActives() {
    return await this.getRoles('role.deleted = false')
  }

  /**
   * Busca un rol por su ID.
   *
   * @param id - Identificador único del rol.
   * @throws Error si el rol no existe.
   * @returns El rol encontrado.
   */
  async findOne(id: string):Promise<SuccessResponse | ErrorResponse> {

    const role = await this.roleRepository
    .createQueryBuilder('role')
    .select([
      'role.id',
      'role.description',
      'role.deleted',
    ])
    .where('role.deleted = :deleted', { deleted: false })
    .andWhere('role.id = :id', { id })
    .getOne();
    
    if (!role) return errorResponse('rol no encontrado');

    return successResponse('Hemos encontrado el rol', role)
  }

  async findOneDescription(description: string):Promise<SuccessResponse|ErrorResponse>{

    const role = this.roleRepository
    .createQueryBuilder('role')
    .select([
      'role.id'
    ])
    .where('role.description = :description', { description })
    .getOne();

    if (!role) return errorResponse('Ese rol no existe');
    return successResponse('El rol ha sido encontrado', role)
  }

  private async checkRoleStatus(id: string, deleted: boolean, errorMsg: string){
    const role = await this.roleRepository
    .createQueryBuilder('role')
    .where('role.deleted = :deleted', { deleted })
    .andWhere('role.id = :id', { id })
    .getExists();

    if (!role) return errorResponse(errorMsg)

    return true
  }
  async isRoleActive(id: string) {
    return await this.checkRoleStatus(id, false, 'Ese rol no existe')
  }

  async isRoleDeleted(id: string) {
    return await this.checkRoleStatus(id, true, 'Ese rol todavia no ha sido eliminado')
  }

  async isRoleExisting (description: string){
    const isRoleExisting = await this.roleRepository
    .createQueryBuilder('role')
    .where('role.description = :description', { description })
    .andWhere('role.deleted = false')
    .getOne();

    return isRoleExisting ? errorResponse('Ese rol ya existe') : true;
  }
  /**
   * Actualiza un rol existente por ID.
   *
   * @param id - ID del rol a actualizar.
   * @param dto - Datos actualizados del rol.
   * @returns El rol actualizado.
   */
  async update(id: string, dto: UpdateRoleDto):Promise<SuccessResponse | ErrorResponse> {
    const exists = await this.isRoleActive(id);
    if (isErrorResponse(exists)) return exists;

    try {
      await this.roleRepository
        .createQueryBuilder()
        .update(Role)
        .set({ ...dto })
        .where('id = :id', { id })
        .execute();

        const updatedRole = await this.findOne(id);

        return successResponse('Hemos modificado el rol', updatedRole)
        
    } catch (error) {
      console.error('[RolesService][update] error al modificar el rol: ',error)
      return errorResponse('Hubo un problemita al modificar el rol')
    }
  
    // Retorna el rol actualizado
  }
  

private async toggleDelete(id: string, deleted: boolean, successMsg: string, errorMsg: string):Promise<SuccessResponse | ErrorResponse> {
  try {
    await this.roleRepository
      .createQueryBuilder()
      .update(Role)
      .set({ deleted })
      .where('id = :id', { id })
      .execute();

    return successResponse(successMsg);
  } catch (error) {
    console.error('[RolesService][toggleDelete] error de la accion', error);
    
    return errorResponse(errorMsg);
  }
}
  
  async remove(id: string) {
    const isActive = await this.isRoleActive(id);
    if (isErrorResponse(isActive)) return isActive; 
    return this.toggleDelete(id, true, 'El rol ha sido eliminado','no se pudo eliminar el rol')
  }

  /**
   * Restaura un rol previamente eliminado (soft restore).
   *
   * @param id - ID del rol a restaurar.
   * @returns El rol restaurado (estado `deleted` en false).
   */
  async restore(id: string) {
    const isDeleted = await this.isRoleDeleted(id)
    if (isErrorResponse(isDeleted)) return isDeleted;
    return this.toggleDelete(id, false, 'El rol ha sido restaurado','no se pudo restaurar el rol')
  }
}
