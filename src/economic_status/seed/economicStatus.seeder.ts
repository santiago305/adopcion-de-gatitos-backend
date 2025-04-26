import { DataSource } from 'typeorm';
import { EconomicStatusType } from '../../common/constants';
import { EconomicStatus } from '../entities/economic_status.entity';

/**
 * Función para sembrar los niveles de estado económico en la base de datos.
 * 
 * Esta función toma los valores definidos en `EconomicStatusType` y los inserta en la tabla 
 * `economic_status` si no existen previamente. La función verifica la existencia de un estado
 * económico antes de insertarlo para evitar duplicados. Los estados económicos se crean a partir 
 * de los valores definidos en la constante `EconomicStatusType`.
 * 
 * @param {DataSource} dataSource - La fuente de datos de TypeORM que se usa para interactuar con la base de datos.
 * @returns {Promise<void>} Una promesa que se resuelve cuando se han insertado los niveles económicos o se ha verificado que ya existen.
 * 
 * @example
 * // Llamada a la función para sembrar los roles de estado económico
 * await seedRoles(dataSource);
 */
export const seedEconomicStatus = async (dataSource: DataSource) => {
  // Obtiene el repositorio de la entidad EconomicStatus
  const repo = dataSource.getRepository(EconomicStatus);

  // Mapea los valores del tipo de estado económico a instancias de la entidad EconomicStatus
  const economicStatusToInsert = Object.values(EconomicStatusType).map((economicStatusLevel) =>
    repo.create({ level: economicStatusLevel })
  );

  // Itera sobre los niveles económicos y los inserta en la base de datos si no existen
  for (const economicStatus of economicStatusToInsert) {
    const exists = await repo.findOneBy({ level: economicStatus.level });
    if (!exists) {
      await repo.save(economicStatus);  // Inserta el nuevo nivel económico
      console.log(`Rol insertado: ${economicStatus.level}`);
    } else {
      console.log(`Rol ya existe: ${economicStatus.level}`);
    }
  }
};
