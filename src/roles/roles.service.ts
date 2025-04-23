import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async create(dto: CreateRoleDto) {
    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async findAll() {
    return this.roleRepository.find();
  }

  async findActives() {
    return this.roleRepository.find({
      where: { deleted: false },
      relations: ['users'],
    });
  }

  async findOne(id: number) {
    const role = await this.roleRepository.findOneBy({ id });
    if (!role) throw new Error(`el rol ${id} no ha sido encontrado`);
    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);
    await this.roleRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    role.deleted = true;
    return this.roleRepository.save(role);
  }

  async restore(id: number) {
    const role = await this.findOne(id);
    role.deleted = false;
    return this.roleRepository.save(role);
  }
}
