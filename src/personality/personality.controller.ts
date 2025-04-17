import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { CreatePersonalityDto } from './dto/create-personality.dto';
import { UpdatePersonalityDto } from './dto/update-personality.dto';

@Controller('personality')
export class PersonalityController {
  constructor(private readonly personalityService: PersonalityService) {}

  @Post()
  create(@Body() createPersonalityDto: CreatePersonalityDto) {
    return this.personalityService.create(createPersonalityDto);
  }

  @Get()
  findAll() {
    return this.personalityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personalityService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonalityDto: UpdatePersonalityDto) {
    return this.personalityService.update(+id, updatePersonalityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personalityService.remove(+id);
  }
}
