import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User as CurrentUser } from 'src/common/decorators/user.decorator';

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('findAll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findAll(
    @Query('page') page: string,
    @Query('gender') gender: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: 'ASC' | 'DESC'
  ) {
    const pageNumber = parseInt(page) || 1;
    return this.clientsService.findAll({
      page: pageNumber,
      filters: { gender },
      sortBy: sortBy || 'user.createdAt',
      order: order || 'DESC',
    });
  }

  @Get('actives')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findActives(
    @Query('page') page: string,
    @Query('gender') gender: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: 'ASC' | 'DESC'
  ) {
    const pageNumber = parseInt(page) || 1;
    return this.clientsService.findActives({
      page: pageNumber,
      filters: { gender },
      sortBy: sortBy || 'user.createdAt',
      order: order || 'DESC',
    });
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  create(
    @Body() dto: CreateClientDto & { userId?: string },
    @CurrentUser() user: { userId: string }
  ) {
    return this.clientsService.create(dto, user);
  }

  @Get('client-me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  findMyClient(@CurrentUser() user: { userId: string }) {
    return this.clientsService.findOne(user);
  }

  @Get('search/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findOne(@Param('id') clientId: string) {
    return this.clientsService.findByClientId(clientId);
  }

  @Patch('update/me')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER)
  updateOwn(@Body() dto: UpdateClientDto, @CurrentUser() user: { userId: string }) {
    return this.clientsService.updateOwn(user, dto);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  updateById(@Param('id') clientId: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.updateByClientId(clientId, dto);
  }


  @Get('check-active/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR, RoleType.USER)
  async checkClientActive(@Param('id') clientId: string) {
    const target = { type: 'clientId' as 'userId' | 'clientId', value: clientId }; // Especificamos 'clientId' como tipo
    return this.clientsService.isClientActive(target);
  }

  // Controlador para verificar si el cliente está eliminado
  @Get('check-deleted/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR, RoleType.USER)
  async checkClientDeleted(@Param('id') clientId: string) {
    const target = { type: 'clientId' as 'userId' | 'clientId', value: clientId }; // Especificamos 'clientId' como tipo
    return this.clientsService.isClientDeleted(target);
  }


// Eliminar o restaurar la cuenta de un usuario o cliente
  @Patch('remove/me')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER)
  removeOwn(@CurrentUser() user: { userId: string }) {
    return this.clientsService.remove(user); // Aquí se pasa el `userId` del usuario logueado
  }

  @Patch('remove/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  removeById(@Param('id') clientId: string, @CurrentUser() user: { userId: string }) {
    return this.clientsService.remove(user, clientId); // Aquí se pasa el `clientId` del cliente a eliminar
  }

  // Restaurar la cuenta de un cliente (solo administradores)
  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  restore(@Param('id') clientId: string, @CurrentUser() user: { userId: string }) {
    return this.clientsService.restore(user, clientId); // Restaurar la cuenta de un cliente especificado por `clientId`
  }
}
