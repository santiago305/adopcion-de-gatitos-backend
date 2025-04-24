import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EconomicStatusService } from './economic_status.service';
import { CreateEconomicStatusDto } from './dto/create-economic_status.dto';
import { UpdateEconomicStatusDto } from './dto/update-economic_status.dto';

@Controller('economic-status')
export class EconomicStatusController {
  constructor(private readonly economicStatusService: EconomicStatusService) {}

  @Post()
  create(@Body() dto: CreateEconomicStatusDto) {
    return this.economicStatusService.create(dto);
  }

  @Get()
  findAll() {
    return this.economicStatusService.findAll();
  }

  @Get('actives')
  findActives() {
    return this.economicStatusService.findActives();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.economicStatusService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEconomicStatusDto) {
    return this.economicStatusService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.economicStatusService.remove(+id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.economicStatusService.restore(+id);
  }
}
