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
import { User } from 'src/common/decorators/user.decorator';

/**
 * Controlador para gestionar las rutas relacionadas con los clientes.
 * Este controlador proporciona operaciones para administrar y acceder a los clientes,
 * tanto para usuarios como para administradores y moderadores.
 */
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // Rutas administrativas

  /**
   * Obtiene todos los clientes.
   * 
   * Solo los usuarios con rol de administrador o moderador pueden acceder a esta ruta.
   * 
   * @returns {Promise<Client[]>} Lista de todos los clientes.
   */
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

  /**
   * Obtiene todos los clientes activos (no eliminados).
   * 
   * Solo los usuarios con rol de administrador o moderador pueden acceder a esta ruta.
   * 
   * @returns {Promise<Client[]>} Lista de clientes activos.
   */
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


  // Rutas de usuarios

  /**
   * Crea un nuevo cliente.
   * 
   * Solo los usuarios con rol de 'USER' pueden acceder a esta ruta.
   * 
   * @param {CreateClientDto} dto - Los datos necesarios para crear el cliente.
   * @param {any} user - Información del usuario que está realizando la solicitud.
   * @returns {Promise<Client>} El cliente recién creado.
   */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER)
  create(@Body() dto: CreateClientDto, @User() user:{userId:string}) {
    return this.clientsService.create(dto, user);
  }

  /**
   * Obtiene el cliente asociado al usuario autenticado.
   * 
   * Solo los usuarios con rol de 'USER' pueden acceder a esta ruta.
   * 
   * @param {any} user - Información del usuario autenticado.
   * @returns {Promise<Client>} El cliente asociado al usuario.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  findMyClient(@User() user: any) {
    return this.clientsService.findOwnClient(user.userId);
  }

    /**
   * Obtiene un cliente por su ID.
   * 
   * Solo los usuarios con rol de administrador o moderador pueden acceder a esta ruta.
   * 
   * @param {string} id - El ID del cliente a buscar.
   * @returns {Promise<Client>} El cliente correspondiente al ID.
   */
    @Get('search/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN, RoleType.MODERATOR)
    findOne(@User() user: any) {
      return this.clientsService.findOne(user);
    }
  
    /**
     * Elimina un cliente por su ID.
     * 
     * Solo los usuarios con rol de administrador o moderador pueden acceder a esta ruta.
     * 
     * @param {string} id - El ID del cliente a eliminar.
     * @returns {Promise<Client>} El cliente eliminado.
     */
    @Patch('remove/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    remove(@User() user: any) {
      return this.clientsService.remove(user);
    }
  
    /**
     * Restaura un cliente eliminado.
     * 
     * Solo los usuarios con rol de administrador o moderador pueden acceder a esta ruta.
     * 
     * @param {string} id - El ID del cliente a restaurar.
     * @returns {Promise<Client>} El cliente restaurado.
     */
    @Patch('restore/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(RoleType.ADMIN, RoleType.MODERATOR)
    restore(@User() user: any) {
      return this.clientsService.restore(user);
    }
  
  // Rutas para todos los roles

  /**
   * Actualiza los datos de un cliente.
   * 
   * Los usuarios con cualquier rol (administrador, moderador, usuario) pueden acceder a esta ruta,
   * pero se aplican restricciones según el rol.
   * 
   * @param {string} id - El ID del cliente a actualizar.
   * @param {UpdateClientDto} dto - Los nuevos datos del cliente.
   * @param {any} user - Información del usuario autenticado.
   * @returns {Promise<Client>} El cliente actualizado.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR, RoleType.USER)
  update(
    @Body() dto: UpdateClientDto,
    @User() user: any,
  ) {
    return this.clientsService.update(user, dto);
  }
}
