import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/entities/role.entity';
import * as argon2 from 'argon2';
import { mapUser, mapUserList } from './utils/user.mapper';
import { RoleType } from 'src/common/constants';

/**
 * UsersService proporciona operaciones CRUD para los usuarios del sistema.
 * Incluye creación, actualización, recuperación, eliminación lógica y restauración.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  /**
   * Retorna todos los usuarios activos (no eliminados).
   * @returns Lista de usuarios
   */
  async findAll() {
    const users = await this.userRepository.find({
      where: { deleted: false },
      relations: ['role'],
    });
    return users.map(mapUserList);
  }

  /**
   * Alias de `findAll` para obtener usuarios activos.
   * @returns Lista de usuarios activos
   */
  async findActives() {
    const users = await this.userRepository.find({
      where: { deleted: false },
      relations: ['role'],
    });
    return users.map(mapUserList);
  }

  /**
   * Busca un usuario por su ID.
   * @param id ID del usuario
   * @throws NotFoundException si no se encuentra
   * @returns Usuario encontrado
   */
  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, deleted: false },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return mapUserList(user);
  }

  /**
   * Busca un usuario por su correo electrónico.
   * @param email Email del usuario
   * @throws NotFoundException si no se encuentra
   * @returns Usuario encontrado
   */
  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, deleted: false },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado por email');
    // return this.mapUser(user);
    return user;
  }

  /**
   * Crea un nuevo usuario con contraseña encriptada usando argon2id.
   * @param dto Datos de creación del usuario
   * @throws BadRequestException si el email ya está en uso
   * @returns Usuario creado
   */
  async create(dto: CreateUserDto, requesterRole: string) {
    const existing = await this.userRepository.findOneBy({ email: dto.email });
    if (existing) {
      throw new BadRequestException('El email ya está en uso');
    }

    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    const DEFAULT_ROLE_ID = 3;
    const roleId = requesterRole === RoleType.ADMIN ? (dto.roleId ?? DEFAULT_ROLE_ID) : DEFAULT_ROLE_ID;

    const roleExists = await this.roleRepository.findOneBy({ id: roleId });
    if (!roleExists) {
      throw new BadRequestException(`Rol con ID ${roleId} no existe`);
    }

    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      role: { id: roleId },
    });

    const saved = await this.userRepository.save(user);
    return mapUser(saved);
  }

  /**
   * Actualiza los datos de un usuario.
   * Si se cambia la contraseña, la nueva se encripta con argon2id.
   * @param id ID del usuario a actualizar
   * @param dto Datos de actualización
   * @throws NotFoundException si el usuario no existe
   * @throws BadRequestException si el nuevo email ya está en uso
   * @returns Usuario actualizado
   */
  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== id) {
        throw new BadRequestException('El correo electrónico ya está en uso por otro usuario');
      }
    }

    if (dto.name) user.name = dto.name;
    if (dto.email) user.email = dto.email;
    if (dto.password) {
      user.password = await argon2.hash(dto.password, {
        type: argon2.argon2id,
      });
    }
    if (dto.roleId) user.role = { id: dto.roleId } as Role;

    await this.userRepository.save(user);
    return mapUserList(user);
  }

  /**
   * Elimina lógicamente un usuario (soft delete).
   * @param id ID del usuario
   * @throws NotFoundException si el usuario no existe
   * @returns Usuario marcado como eliminado
   */
  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.deleted = true;
    const saved = await this.userRepository.save(user);
    return mapUserList(saved);
  }

  /**
   * Restaura un usuario previamente eliminado.
   * @param id ID del usuario
   * @throws NotFoundException si el usuario no existe
   * @returns Usuario restaurado
   */
  async restore(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.deleted = false;
    const saved = await this.userRepository.save(user);
    return mapUserList(saved);
  }
}
