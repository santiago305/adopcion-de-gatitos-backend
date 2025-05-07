import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/common/decorators';
import { RoleType } from 'src/common/constants';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { User as CurrentUser, User } from 'src/common/decorators/user.decorator';

/**
 * Controlador para la gestión de usuarios.
 * Este controlador gestiona las operaciones CRUD (crear, leer, actualizar, eliminar)
 * para los usuarios, y está protegido con autenticación y roles.
 * 
 * @Controller('users') 
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crea un nuevo usuario.
   * 
   * @param dto Los datos necesarios para crear el usuario. (Creación de usuario)
   * @param currentUser Información del usuario autenticado (opcional, se usa para roles).
   * @returns El usuario recién creado.
   * 
   * @example
   * // Crea un nuevo usuario
   * usersController.create(createUserDto);
   */
  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser?: any 
  ) {
    return this.usersService.create(dto, currentUser?.role);
  }

  /**
   * Obtiene todos los usuarios activos (no eliminados).
   * Solo accesible por administradores.
   * 
   * @returns Lista de usuarios activos.
   * 
   * @throws UnauthorizedException Si el usuario no está autenticado.
   * @throws ForbiddenException Si el usuario no tiene el rol adecuado.
   * 
   * @example
   * // Obtiene todos los usuarios activos
   * usersController.findAll();
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async findAll(
    @Query('page') page: string,
    @Query('role') role: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: 'ASC' | 'DESC'
  ) {
    const pageNumber = parseInt(page) || 1;

    return this.usersService.findAll({
      page: pageNumber,
      filters: { role },
      sortBy: sortBy || 'user.createdAt',
      order: order || 'DESC',
    });
  }
  
  @Get('actives')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  async findAllActives(
    @Query('page') page: string,
    @Query('role') role: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: 'ASC' | 'DESC'
  ) {
    const pageNumber = parseInt(page) || 1;

    return this.usersService.findAll({
      page: pageNumber,
      filters: { role },
      sortBy: sortBy || 'user.createdAt',
      order: order || 'DESC',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@User() user: any) {
    return this.usersService.findOwnUser(user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }


  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }
}
