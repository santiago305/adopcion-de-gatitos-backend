import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

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
  async create(dto: CreateRoleDto) {
    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  /**
   * Obtiene todos los roles registrados.
   * 
   * @returns Lista completa de roles.
   * @throws Error si no se encuentran roles.
   * pnpm run seed guarda datos predeterminados
   */
  async findAll() {
    return this.roleRepository.find();
  }

  /**
   * Obtiene todos los roles que no están marcados como eliminados.
   *
   * @returns Lista de roles activos junto con sus relaciones (por ejemplo, usuarios).
   */
  async findActives() {
    return this.roleRepository.find({
      where: { deleted: false },
      relations: ['users'],
    });
  }

  /**
   * Busca un rol por su ID.
   *
   * @param id - Identificador único del rol.
   * @throws Error si el rol no existe.
   * @returns El rol encontrado.
   */
  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id, deleted: false });
    if (!role) throw new Error(`El rol ${id} no ha sido encontrado`);
    return role;
  }

  /**
   * Actualiza un rol existente por ID.
   *
   * @param id - ID del rol a actualizar.
   * @param dto - Datos actualizados del rol.
   * @returns El rol actualizado.
   */
  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);
    await this.roleRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Marca un rol como eliminado (soft delete).
   *
   * @param id - ID del rol a eliminar.
   * @returns El rol marcado como eliminado.
   */
  async remove(id: number) {
    const role = await this.findOne(id);
    role.deleted = true;
    return this.roleRepository.save(role);
  }

  /**
   * Restaura un rol previamente eliminado (soft restore).
   *
   * @param id - ID del rol a restaurar.
   * @returns El rol restaurado (estado `deleted` en false).
   */
  async restore(id: number) {
    const role = await this.roleRepository.findOne(
      { where: { id, deleted: true } },
    );
    role.deleted = false;
    return this.roleRepository.save(role);
  }
}
