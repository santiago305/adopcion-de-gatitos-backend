import { Injectable } from '@nestjs/common';
import { CreateAdoptionDto } from './dto/create-adoption.dto';
import { UpdateAdoptionDto } from './dto/update-adoption.dto';

@Injectable()
export class AdoptionsService {
  create(createAdoptionDto: CreateAdoptionDto) {
    return 'This action adds a new adoption';
  }

  findAll() {
    return `This action returns all adoptions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adoption`;
  }

  update(id: number, updateAdoptionDto: UpdateAdoptionDto) {
    return `This action updates a #${id} adoption`;
  }

  remove(id: number) {
    return `This action removes a #${id} adoption`;
  }
}
