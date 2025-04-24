import { Injectable } from '@nestjs/common';
import { CreateEconomicStatusDto } from './dto/create-economic_status.dto';
import { UpdateEconomicStatusDto } from './dto/update-economic_status.dto';
import { EconomicStatus } from './entities/economic_status.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EconomicStatusService {
  constructor(
    @InjectRepository(EconomicStatus)
    private readonly economicStatusRepository: Repository<EconomicStatus>,
  ) {}
  async create(dto: CreateEconomicStatusDto) {
    const economicStatus = this.economicStatusRepository.create(dto);
    return this.economicStatusRepository.save(economicStatus);
  }

  async findAll() {
    return this.economicStatusRepository.find();
  }
  async findActives() {
    return this.economicStatusRepository.find({
      where: { deleted: false },
      relations: ['clients'],
    });
  }
  async findOne(id: number) {
    const economicStatus = await this.economicStatusRepository.findOneBy({ id, deleted: false });
    if (!economicStatus) throw new Error(`Este nivel de economia con ${id} no ha sido encontrado`);
    return economicStatus;
  }

  async update(id: number, dto: UpdateEconomicStatusDto) {
    await this.findOne(id);
    await this.economicStatusRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const role = await this.findOne(id);
    role.deleted = true;
    return this.economicStatusRepository.save(role);
  }

  async restore(id: number) {
    const role = await this.economicStatusRepository.findOne(
      { where: { id, deleted: true } },
    );
    role.deleted = false;
    return this.economicStatusRepository.save(role);
  }
}
