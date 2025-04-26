import { Injectable } from '@nestjs/common';
import { CreateEconomicStatusDto } from './dto/create-economic_status.dto';
import { UpdateEconomicStatusDto } from './dto/update-economic_status.dto';
import { EconomicStatus } from './entities/economic_status.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Servicio encargado de gestionar la lógica de negocio relacionada con los estados económicos.
 * 
 * Este servicio proporciona los métodos necesarios para crear, leer, actualizar, eliminar y restaurar
 * estados económicos, así como para obtener los estados económicos activos.
 * 
 * @service
 */
@Injectable()
export class EconomicStatusService {
  constructor(
    /**
     * Repositorio de TypeORM que permite interactuar con la base de datos para realizar operaciones 
     * sobre la entidad `EconomicStatus`.
     * 
     * @repository Repository<EconomicStatus>
     */
    @InjectRepository(EconomicStatus)
    private readonly economicStatusRepository: Repository<EconomicStatus>,
  ) {}

  /**
   * Crea un nuevo estado económico.
   * 
   * Este método recibe un DTO con los datos necesarios para crear un nuevo estado económico 
   * y lo guarda en la base de datos.
   * 
   * @param {CreateEconomicStatusDto} dto - El DTO con los datos para crear el nuevo estado económico.
   * @returns {Promise<EconomicStatus>} El estado económico recién creado.
   */
  async create(dto: CreateEconomicStatusDto) {
    const economicStatus = this.economicStatusRepository.create(dto);
    return this.economicStatusRepository.save(economicStatus);
  }

  /**
   * Obtiene todos los estados económicos.
   * 
   * Recupera todos los estados económicos de la base de datos.
   * 
   * @returns {Promise<EconomicStatus[]>} Lista de todos los estados económicos.
   */
  async findAll() {
    return this.economicStatusRepository.find();
  }

  /**
   * Obtiene los estados económicos activos (no eliminados).
   * 
   * Recupera todos los estados económicos que no han sido eliminados lógicamente. Además, 
   * incluye los clientes relacionados con cada estado económico.
   * 
   * @returns {Promise<EconomicStatus[]>} Lista de estados económicos activos.
   */
  async findActives() {
    return this.economicStatusRepository.find({
      where: { deleted: false },
    });
  }

  /**
   * Obtiene un estado económico específico por su ID.
   * 
   * Este método busca un estado económico por su identificador único y verifica si está 
   * disponible y no ha sido eliminado lógicamente.
   * 
   * @param {number} id - El ID del estado económico que se desea recuperar.
   * @returns {Promise<EconomicStatus>} El estado económico encontrado.
   * @throws {Error} Si no se encuentra el estado económico o está eliminado.
   */
  async findOne(id: number) {
    const economicStatus = await this.economicStatusRepository.findOneBy({ id, deleted: false });
    if (!economicStatus) throw new Error(`Este nivel de economia con ${id} no ha sido encontrado`);
    return economicStatus;
  }

  /**
   * Actualiza un estado económico existente.
   * 
   * Permite actualizar un estado económico proporcionando los nuevos datos en el DTO 
   * `UpdateEconomicStatusDto`. Este método primero verifica si el estado económico existe.
   * 
   * @param {number} id - El ID del estado económico a actualizar.
   * @param {UpdateEconomicStatusDto} dto - El DTO con los datos a actualizar.
   * @returns {Promise<EconomicStatus>} El estado económico actualizado.
   */
  async update(id: number, dto: UpdateEconomicStatusDto) {
    await this.findOne(id);
    await this.economicStatusRepository.update(id, dto);
    return this.findOne(id);
  }

  /**
   * Elimina un estado económico de manera lógica (marcándolo como eliminado).
   * 
   * Este método marca un estado económico como eliminado sin eliminarlo físicamente de la base de datos.
   * 
   * @param {number} id - El ID del estado económico a eliminar.
   * @returns {Promise<EconomicStatus>} El estado económico marcado como eliminado.
   */
  async remove(id: number) {
    const economicStatus = await this.findOne(id);
    economicStatus.deleted = true;
    return this.economicStatusRepository.save(economicStatus);
  }

  /**
   * Restaura un estado económico previamente eliminado.
   * 
   * Permite restaurar un estado económico que ha sido eliminado lógicamente (marcado como `deleted: true`).
   * 
   * @param {number} id - El ID del estado económico a restaurar.
   * @returns {Promise<EconomicStatus>} El estado económico restaurado.
   */
  async restore(id: number) {
    const economicStatus = await this.economicStatusRepository.findOne({ where: { id, deleted: true } });
    if (!economicStatus) throw new Error(`Estado económico con id ${id} no está eliminado`);
    economicStatus.deleted = false;
    return this.economicStatusRepository.save(economicStatus);
  }
}
