import { 
Controller, 
Get, 
Post, 
Body, 
Patch, 
Param, 
Delete, 
UseGuards 
} from '@nestjs/common';
import { EconomicStatusService } from './economic_status.service';
import { CreateEconomicStatusDto } from './dto/create-economic_status.dto';
import { UpdateEconomicStatusDto } from './dto/update-economic_status.dto';
import { Roles } from 'src/common/decorators';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RoleType } from 'src/common/constants';

/**
 * Controlador para gestionar los estados económicos.
 * 
 * Este controlador permite realizar operaciones CRUD sobre los estados económicos 
 * de la aplicación. Las acciones están restringidas a usuarios con roles de 
 * administrador o moderador, gracias al uso de los guardias de autenticación y roles.
 * 
 * @controller
 * @useGuards JwtAuthGuard, RolesGuard
 * @roles ADMIN, MODERATOR
 */
@Controller('economic-status')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleType.ADMIN, RoleType.MODERATOR)
export class EconomicStatusController {
  constructor(private readonly economicStatusService: EconomicStatusService) {}

  /**
   * Crea un nuevo estado económico.
   * 
   * Permite crear un estado económico proporcionando los datos necesarios en el 
   * cuerpo de la solicitud. Esta operación solo está permitida a los usuarios 
   * con roles de ADMIN o MODERATOR.
   * 
   * @param {CreateEconomicStatusDto} dto - El DTO con los datos para crear el nuevo estado económico.
   * @returns {Promise<EconomicStatus>} El estado económico creado.
   * 
   * @route POST /economic-status
   */
  @Post()
  create(@Body() dto: CreateEconomicStatusDto) {
    return this.economicStatusService.create(dto);
  }

  /**
   * Obtiene todos los estados económicos existentes.
   * 
   * Recupera todos los estados económicos de la base de datos. Esta operación 
   * está restringida a los usuarios con roles de ADMIN o MODERATOR.
   * 
   * @returns {Promise<EconomicStatus[]>} Lista de todos los estados económicos.
   * 
   * @route GET /economic-status
   */
  @Get()
  findAll() {
    return this.economicStatusService.findAll();
  }

  /**
   * Obtiene todos los estados económicos activos.
   * 
   * Recupera los estados económicos que no han sido eliminados lógicamente. 
   * Esta operación está restringida a los usuarios con roles de ADMIN o MODERATOR.
   * 
   * @returns {Promise<EconomicStatus[]>} Lista de estados económicos activos.
   * 
   * @route GET /economic-status/actives
   */
  @Get('actives')
  findActives() {
    return this.economicStatusService.findActives();
  }

  /**
   * Obtiene un estado económico por su ID.
   * 
   * Permite obtener un estado económico específico mediante su identificador único.
   * Esta operación está restringida a los usuarios con roles de ADMIN o MODERATOR.
   * 
   * @param {string} id - El ID del estado económico que se desea recuperar.
   * @returns {Promise<EconomicStatus>} El estado económico encontrado.
   * 
   * @route GET /economic-status/:id
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.economicStatusService.findOne(+id);
  }

  /**
   * Actualiza un estado económico existente.
   * 
   * Permite actualizar un estado económico proporcionando los nuevos datos en 
   * el cuerpo de la solicitud. Esta operación está restringida a los usuarios 
   * con roles de ADMIN o MODERATOR.
   * 
   * @param {string} id - El ID del estado económico a actualizar.
   * @param {UpdateEconomicStatusDto} dto - El DTO con los datos de actualización.
   * @returns {Promise<EconomicStatus>} El estado económico actualizado.
   * 
   * @route PATCH /economic-status/:id
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEconomicStatusDto) {
    return this.economicStatusService.update(+id, dto);
  }

  /**
   * Elimina un estado económico de manera lógica.
   * 
   * Elimina un estado económico marcándolo como eliminado, sin eliminarlo físicamente de la base de datos.
   * Esta operación está restringida a los usuarios con roles de ADMIN o MODERATOR.
   * 
   * @param {string} id - El ID del estado económico a eliminar.
   * @returns {Promise<EconomicStatus>} El estado económico marcado como eliminado.
   * 
   * @route DELETE /economic-status/:id
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.economicStatusService.remove(+id);
  }

  /**
   * Restaura un estado económico previamente eliminado.
   * 
   * Permite restaurar un estado económico que ha sido eliminado lógicamente. 
   * Esta operación está restringida a los usuarios con roles de ADMIN o MODERATOR.
   * 
   * @param {string} id - El ID del estado económico a restaurar.
   * @returns {Promise<EconomicStatus>} El estado económico restaurado.
   * 
   * @route PATCH /economic-status/:id/restore
   */
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.economicStatusService.restore(+id);
  }
}
