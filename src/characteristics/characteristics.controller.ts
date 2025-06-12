import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Query,
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
export class CharacteristicsController {
  constructor(private readonly service: CharacteristicsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  create(@Body() dto: CreateCharacteristicsDto) {
    return this.service.create(dto);
  }

  @Get('findAll')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15
  ) {
    return this.service.findAll(page, limit);
  }

  @Get('searchByPersonality')
  @UseGuards(JwtAuthGuard)
  findByPersonality(@Query('name') name: string) {
    return this.service.findByPersonalityName(name);
  }

  @Get('search/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCharacteristicDto
  ) {
    return this.service.update(id, dto);
  }

  @Patch('remove/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) {
    return this.service.restore(id);
  }
  @Get('searchByKeyword')
  @UseGuards(JwtAuthGuard)
  findByKeyword(@Query('keyword') keyword: string) {
    return this.service.findByKeyword(keyword);
  }
}
