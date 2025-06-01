import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
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
import { User as CurrentUser } from 'src/common/decorators/user.decorator';

/**
 * Controlador para la gestión de usuarios.
 * Este controlador gestiona las operaciones CRUD (crear, leer, actualizar, eliminar)
 * para los usuarios, y está protegido con autenticación y roles.
 * 
 * @Controller('users') 
 */

// localhost:3000/api/users
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: { role: RoleType }
  ) {
    return this.usersService.create(dto, user.role);
  }

  @Get('findAll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
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
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  async findActives(
    @Query('page') page: string,
    @Query('role') role: string,
    @Query('sortBy') sortBy: string,
    @Query('order') order: 'ASC' | 'DESC'
  ) {
    const pageNumber = parseInt(page) || 1;

    return this.usersService.findActives({
      page: pageNumber,
      filters: { role },
      sortBy: sortBy || 'user.createdAt',
      order: order || 'DESC',
    });
  }
  
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.usersService.findOwnUser(user.userId);
  }
  
  @Get('search/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
  @Get('email/:email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }


  @Patch('delete/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }


  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  restore(@Param('id') id: string) {
    return this.usersService.restore(id);
  }
}
