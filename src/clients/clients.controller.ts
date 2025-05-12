import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User as CurrentUser } from 'src/common/decorators/user.decorator';

/**
 * Controlador para gestionar las rutas relacionadas con los clientes.
 * Este controlador proporciona operaciones para administrar y acceder a los clientes,
 * tanto para usuarios como para administradores y moderadores.
 */
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
  @Roles(RoleType.USER)
  create(@Body() dto: CreateClientDto, @CurrentUser() user:{userId:string}) {
    return this.clientsService.create(dto, user);
  }


  @Get('client-me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  findMyClient(@CurrentUser() user: { userId: string }) {
    return this.clientsService.findOwnClient(user);
  }

  @Get('check-existing-clients/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  checkExistingClients(@CurrentUser() user: {userId : string}){
    return this.clientsService.isClientExist(user.userId)
  }


  @Get('search/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findOne(@CurrentUser() user: any) {
    return this.clientsService.findOne(user);
  }

  @Patch('remove/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@CurrentUser() user: any) {
    return this.clientsService.remove(user);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  restore(@CurrentUser() user: any) {
    return this.clientsService.restore(user);
  }
  

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR, RoleType.USER)
  update(
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: any,
  ) {
    return this.clientsService.update(user, dto);
  }
}
