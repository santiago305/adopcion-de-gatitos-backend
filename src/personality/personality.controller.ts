import { Controller, Post, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { CreatePersonalityDto } from './dto/create-personality.dto';
import { UpdatePersonalityDto } from './dto/update-personality.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';

@Controller('personality')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN)
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  @Post('create')
  create(@Body() dto: CreatePersonalityDto) {
    return this.personalityService.create(dto);
  }

  @Get('findAll')
  findAll() {
    return this.personalityService.findAll();
  }

  @Get('search/:id')
  findOne(@Param('id') id: string) {
    return this.personalityService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() dto: UpdatePersonalityDto) {
    return this.personalityService.update(id, dto);
  }

  @Patch('remove/:id')
  remove(@Param('id') id: string) {
    return this.personalityService.remove(id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.personalityService.restore(id);
  }
}
