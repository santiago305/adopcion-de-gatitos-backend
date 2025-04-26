import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import { EconomicStatus } from 'src/economic_status/entities/economic_status.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { RoleType } from 'src/common/constants';
import { mapClient, mapClientList } from './utils/clients.mapper';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,

    @InjectRepository(EconomicStatus)
    private readonly economicStatusRepository: Repository<EconomicStatus>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateClientDto, user: { userId: number; role: string }) {
    const existing = await this.clientRepository.findOne({
      where: { user: { id: user.userId } },
    });
  
    if (existing) {
      throw new BadRequestException('El cliente ya existe');
    }
  
    // Solo usuarios con rol 'user' pueden crear
    if (user.role !== RoleType.USER) {
      throw new BadRequestException('Solo los usuarios pueden crear clientes');
    }
  
    const economicStatus = await this.economicStatusRepository.findOneBy({ id: 1 });
    if (!economicStatus) {
      throw new BadRequestException('Estado económico por defecto (id=1) no encontrado');
    }
  
    const userEntity = await this.userRepository.findOneBy({ id: user.userId });
    if (!userEntity) {
      throw new BadRequestException('Usuario no encontrado');
    }
  
    const client = this.clientRepository.create({
      address: dto.address,
      phone: dto.phone,
      user: userEntity,
      economicStatus,
    });
  
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }
    
  async findAll() {
    const clients = await this.clientRepository.find({
      relations: ['user', 'economicStatus'],
    });
    return clients.map(mapClientList)
  }

  async findActives() {
    const clients = await this.clientRepository.find({
      where: { deleted: false },
      relations: ['user', 'economicStatus'],
    });
    return clients.map(mapClientList)
  }

  async findOne(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: false },
      relations: ['user', 'economicStatus'],
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    return mapClientList(client);
  }

  async findByUser(userId: number) {
    const client = await this.clientRepository.findOne({
      where: { user: { id: userId }, deleted: false },
      relations: ['user', 'economicStatus'],
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    return mapClient(client);
  }



  async update(id: number, dto: UpdateClientDto, user: { userId: number; role: string }) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: false },
      relations: ['user', 'economicStatus'],
    });

    if (!client) {
      throw new NotFoundException('El cliente no existe o está eliminado');
    }

    const isOwner = client.user.id === user.userId;
    const isAdminOrModerator = [RoleType.ADMIN, RoleType.MODERATOR].includes(user.role as RoleType);

    if (isOwner && user.role === RoleType.USER) {
      if (dto.economicStatusId) {
        throw new ForbiddenException('No tienes permiso para modificar el estado económico');
      }

      if (dto.address) client.address = dto.address;
      if (dto.phone) client.phone = dto.phone;
    } 
    else if (isAdminOrModerator) {
      if (dto.economicStatusId) {
        const status = await this.economicStatusRepository.findOneBy({ id: dto.economicStatusId });
        if (!status) {
          throw new BadRequestException('El estado económico seleccionado no es válido');
        }
        client.economicStatus = status;
      }
      if (dto.address) client.address = dto.address;
      if (dto.phone) client.phone = dto.phone;
    }
    else {
      throw new ForbiddenException('No tienes autorización para actualizar este cliente');
    }

    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }

  

  async remove(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: false },
      relations: ['user', 'economicStatus'],
    });
    client.deleted = true;
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }

  async removeSelf(userId: number) {
    const client = await this.clientRepository.findOne({
      where: { user: { id: userId }, deleted: false },
      relations: ['user', 'economicStatus'],
    });
    client.deleted = true;
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }

  async restore(id: number) {
    const client = await this.clientRepository.findOne({
      where: { id, deleted: true },
      relations: ['user', 'economicStatus'],
    });
    client.deleted = false;
    const saved = await this.clientRepository.save(client);
    return mapClient(saved);
  }
}
