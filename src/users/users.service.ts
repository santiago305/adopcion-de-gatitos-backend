import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private mapUser = (user: User) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    password: user.password,
    deleted: user.deleted,
    role: user.role?.description,
  });

  async findAll() {
    const users = await this.userRepository.find({
      where: { deleted: false },
      relations: ['role'],
    });
    return users.map(this.mapUser);
  }

  async findActives() {
    const users = await this.userRepository.find({
      where: { deleted: false },
      relations: ['role'],
    });
    return users.map(this.mapUser);
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id, deleted: false },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.mapUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email, deleted: false },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado por email');
    return this.mapUser(user);
  }

  async create(dto: CreateUserDto) {
    const existing = await this.userRepository.findOneBy({ email: dto.email });

    if (existing) {
      throw new Error('El email ya está en uso');
    }
    
    const user = this.userRepository.create({
      ...dto,
      role: { id: dto.roleId },
    });
    const saved = await this.userRepository.save(user);
    return this.mapUser(saved);
  }

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
  
    // Actualizar campos uno por uno
    if (dto.name) user.name = dto.name;
    if (dto.email) user.email = dto.email;
    if (dto.password) user.password = dto.password;
    if (dto.roleId) user.role = { id: dto.roleId } as Role;
  
    await this.userRepository.save(user);
    return this.mapUser(user);
  }
  

  async remove(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.deleted = true;
    return this.userRepository.save(user);
  }

  async restore(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.deleted = false;
    const saved = await this.userRepository.save(user);
    return this.mapUser(saved)
  }
}
