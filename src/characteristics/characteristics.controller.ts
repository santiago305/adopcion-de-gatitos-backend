import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { CharacteristicsService } from './characteristics.service';

import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { CreateCharacteristicsDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';

@Controller('characteristics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class CharacteristicsController {
  constructor(private readonly characteristicsService: CharacteristicsService) {}

  @Post('create')
  create(@Body() dto: CreateCharacteristicsDto) {
    return this.characteristicsService.create(dto);
  }

  @Get('findAll')
  findAll() {
    return this.characteristicsService.findAll();
  }

  @Get('search/:id')
  findOne(@Param('id') id: string) {
    return this.characteristicsService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdateCharacteristicDto) {
    return this.characteristicsService.update(id, dto);
  }

  @Patch('remove/:id')
  remove(@Param('id') id: string) {
    return this.characteristicsService.remove(id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.characteristicsService.restore(id);
  }
}
