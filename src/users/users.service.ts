import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/entities/role.entity';
import * as argon2 from 'argon2';
import { mapUser, mapUserList } from './utils/user.mapper';
import { RoleType, status } from 'src/common/constants';

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
    return await this.userRepository
    .createQueryBuilder('user')
    .leftJoin('user.role', 'role')
    .select([
      'user.id',
      'user.name',
      'user.email',
      'role.description',
      'user.deleted',
    ])
    .getRawMany();
  }

  /**
   * Alias de `findAll` para obtener usuarios activos.
   * @returns Lista de usuarios activos
   */
  async findActives() {
    return await this.userRepository
    .createQueryBuilder('user')
    .leftJoin('user.role', 'role')
    .select([
      'user.id',
      'user.name',
      'user.email',
      'role.description',
      'user.deleted',
    ])
    .where('user.deleted = :deleted', { deleted: false })
    .getRawMany();
  }

  /**
   * Busca un usuario por su ID.
   * @param id ID del usuario
   * @throws NotFoundException si no se encuentra
   * @returns Usuario encontrado
   */
  async findOne(id: string) {
    const user = await this.userRepository
    .createQueryBuilder('user')
    .leftJoin('user.role', 'role')
    .select([
      'user.id',
      'user.name',
      'user.email',
      'role.description',
      'user.deleted',
    ])
    .where('user.deleted = :deleted', { deleted: false })
    .andWhere('user.id = :id', { id })
    .getOne();
    
    if (!user) return {
      type: status.ERROR,
      message: 'usuario no encontrado',
    }
  }
  async findExistUser(id: string) {
    const notExist = await this.userRepository
    .createQueryBuilder('user')
    .where('user.id = :id', { id })
    .andWhere('user.deleted = false')
    .getExists();

    if (!notExist) return{type:status.WARNING, message: 'este usuario no ha sido eliminado'}
  }
  async findNotExistUser(id: string) {
    const notExist = await this.userRepository
    .createQueryBuilder('user')
    .where('user.id = :id', { id })
    .andWhere('user.deleted = true')
    .getExists();

    if (!notExist) return{type:status.WARNING, message: 'este usuario no ha sido eliminado'}
  }

  async findOwnUser(userId: string) {
    const user = await this.findOne(userId)
  
    if ((user as {type:status; message:string}).type) {
      return user
    }
  
    return user
  }
  /**
   * Busca un usuario por su correo electrónico.
   * @param email Email del usuario
   * @throws NotFoundException si no se encuentra
   * @returns Usuario encontrado
   */
  async findByEmail(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .select([
        'user.email',
        'user.password'
      ])
      .where('user.email = :email', { email })
      .andWhere('user.deleted = :deleted', { deleted: false })
      .getOne();
  
    if (!user) return {type:status.ERROR, message: 'No hemos encontrado tu usuario'}
    return user;
  }
  
  async findExistEmail(email: string) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.deleted = :deleted', { deleted: false })
      .getExists();
  
    if (!user) return {type:status.WARNING, message: 'Este email ya esta siendo utilizado'};

    return null
  }

  /**
   * Crea un nuevo usuario con contraseña encriptada usando argon2id.
   * @param dto Datos de creación del usuario
   * @throws BadRequestException si el email ya está en uso
   * @returns Usuario creado
   */
  async create(dto: CreateUserDto, requesterRole: string) {
    const existing = await this.findExistEmail(dto.email);
  
    if ((existing as { type: status; message: string })?.type) {
      return existing;
    }
  
    const hashedPassword = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });
  
    const DEFAULT_ROLE_ID = 3;
    const roleId = requesterRole === RoleType.ADMIN
      ? dto.roleId ?? DEFAULT_ROLE_ID
      : DEFAULT_ROLE_ID;
  
    const roleExists = await this.roleRepository
      .createQueryBuilder('role')
      .where('role.id = :id', { id: roleId })
      .getExists();
  
    if (!roleExists) {
      return {
        type: status.ERROR,
        message: 'Ese rol no existe',
      };
    }
  
    await this.userRepository
      .createQueryBuilder()
      .insert()
      .into('user')
      .values({
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: { id: roleId },
      })
      .execute();
  
    return {
      type: status.SUCCESS,
      message: 'Usuario creado correctamente',
    };
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
