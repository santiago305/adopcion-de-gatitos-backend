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
import { DiseasesService } from './diseases.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { CreateDiseasesDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Controller('diseases')
export class DiseasesController {
  constructor(private readonly diseasesService: DiseasesService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  create(@Body() dto: CreateDiseasesDto) {
    return this.diseasesService.create(dto);
  }

   @Get('findAll')
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('page') page: number = 1,  // Parámetro de página (por defecto 1)
    @Query('limit') limit: number = 15 // Parámetro de límite (por defecto 15)
  ) {
    return this.diseasesService.findAll(page, limit);
  }

  @Get('searchByName')
  @UseGuards(JwtAuthGuard)
  findByName(@Query('name') name: string) {
    return this.diseasesService.findByName(name);
  }

  @Get('search/:id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.diseasesService.findOne(id);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateDiseaseDto) {
    return this.diseasesService.update(id, dto);
  }

  @Patch('remove/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.diseasesService.remove(id);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard)
  restore(@Param('id') id: string) {
    return this.diseasesService.restore(id);
  }
}
