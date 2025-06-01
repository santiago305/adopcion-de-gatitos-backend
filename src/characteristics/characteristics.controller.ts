import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CharacteristicsService } from './characteristics.service';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';

@Controller('characteristics')
export class CharacteristicsController {
  constructor(private readonly characteristicsService: CharacteristicsService) {}

  @Post()
  create(@Body() createCharacteristicDto: CreateCharacteristicDto) {
    return this.characteristicsService.create(createCharacteristicDto);
  }

  @Get()
  findAll() {
    return this.characteristicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.characteristicsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCharacteristicDto: UpdateCharacteristicDto) {
    return this.characteristicsService.update(+id, updateCharacteristicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.characteristicsService.remove(+id);
  }
}
