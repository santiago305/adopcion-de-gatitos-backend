import { Injectable } from '@nestjs/common';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';

@Injectable()
export class CharacteristicsService {
  create(createCharacteristicDto: CreateCharacteristicDto) {
    return 'This action adds a new characteristic';
  }

  findAll() {
    return `This action returns all characteristics`;
  }

  findOne(id: number) {
    return `This action returns a #${id} characteristic`;
  }

  update(id: number, updateCharacteristicDto: UpdateCharacteristicDto) {
    return `This action updates a #${id} characteristic`;
  }

  remove(id: number) {
    return `This action removes a #${id} characteristic`;
  }
}
