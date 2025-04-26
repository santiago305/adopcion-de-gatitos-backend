import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // rutas administrativas
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findAll() {
    return this.clientsService.findAll();
  }

  @Get('actives')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findActives() {
    return this.clientsService.findActives();
  }
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }

  @Delete(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  restore(@Param('id') id: string) {
    return this.clientsService.restore(+id);
  }

  // rutas de usuarios
  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER)
  create(@Body() dto: CreateClientDto, @User() user: any) {
    return this.clientsService.create(dto, user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  findMyClient(@User() user: any) {
    return this.clientsService.findByUser(user.userId);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  removeSelf(@User() user: any) {
    return this.clientsService.removeSelf(user.userId);
  }

  // para todos los roles
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR, RoleType.USER)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateClientDto,
    @User() user: any, // 👈 sacas el usuario del token
  ) {
    return this.clientsService.update(+id, dto, user);
  }



}
