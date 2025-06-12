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

  @Get('check-existing-clients/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.USER)
  isClientExist(@CurrentUser() user: { userId: string }){
    return this.clientsService.isClientExist({
      type: 'userId',
      value: user.userId,
    });
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

  @Patch('remove/me')
  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER)
  removeOwn(@CurrentUser() user: { userId: string }) {
    return this.clientsService.remove(user);
  }

  @Patch('remove/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.MODERATOR)
  removeById(@Param('id') clientId: string, @CurrentUser() user: { userId: string }) {
    return this.clientsService.remove(user, clientId);
  }

  @Patch('restore/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  restore(@Param('id') clientId: string, @CurrentUser() user: { userId: string }) {
    return this.clientsService.restore(user, clientId);
  }
}
