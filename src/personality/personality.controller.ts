import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { CreatePersonalityDto } from './dto/create-personality.dto';
import { UpdatePersonalityDto } from './dto/update-personality.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';

@Controller('personality')
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  create(@Body() dto: CreatePersonalityDto) {
    return this.personalityService.create(dto);
  }

  @Get('findAll')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 15,
  ) {
    return this.personalityService.findAll(page, limit);
  }

  @Get('searchByName')
  @UseGuards(JwtAuthGuard)
  findByName(@Query('name') name: string) {
    return this.personalityService.findByName(name);
  }

  @Get('search/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.personalityService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdatePersonalityDto) {
    return this.personalityService.update(id, dto);
  }

  @Patch('remove/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.personalityService.remove(id);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) {
    return this.personalityService.restore(id);
  }
}
