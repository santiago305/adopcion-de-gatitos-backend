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
import { BreedService } from './breed.service';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';

@Controller('breed')
export class BreedController {
  constructor(private readonly breedService: BreedService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  create(@Body() dto: CreateBreedDto) {
    return this.breedService.create(dto);
  }

  @Get('findAll')
  @UseGuards(JwtAuthGuard)
  findAll(@Query('page') page = 1, @Query('limit') limit = 15) {
    return this.breedService.findAll(Number(page), Number(limit));
  }

  @Get('searchByName')
  @UseGuards(JwtAuthGuard)
  findByName(@Query('name') name: string) {
    return this.breedService.findByName(name);
  }

  @Get('search/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.breedService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateBreedDto) {
    return this.breedService.update(id, dto);
  }

  @Patch('delete/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.breedService.remove(id);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) {
    return this.breedService.restore(id);
  }

  @Get('searchBySpecies')
  @UseGuards(JwtAuthGuard)
  findBySpecies(@Query('speciesId') speciesId: string) {
    return this.breedService.findBySpecies(speciesId);
  }

}
