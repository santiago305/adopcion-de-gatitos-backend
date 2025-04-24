import { DataSource } from 'typeorm';
import { EconomicStatusType } from '../../common/constants';
import { EconomicStatus } from '../entities/economic_status.entity';

/**
 * Script de seed que inserta roles predefinidos en la base de datos.
 *
 * Este seeder utiliza el `DataSource` de TypeORM para acceder al repositorio de `Role`
 * y asegura que cada rol definido en `RoleType` exista en la base de datos.
 * Si un rol ya existe, no se vuelve a insertar.
 *
 * @param dataSource - Instancia de conexión a la base de datos proporcionada por TypeORM.
 *
 * @example
 * ```ts
 * import { seedRoles } from './seeds/seed-roles';
 * import { AppDataSource } from './data-source';
 *
 * AppDataSource.initialize().then(async (dataSource) => {
 *   await seedRoles(dataSource);
 * });
 * ```
 */
export const seedRoles = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(EconomicStatus);

  const economicStatusToInsert = Object.values(EconomicStatusType).map((economicStatusLevel) =>
    repo.create({ level: economicStatusLevel })
  );

  for (const economicStatus of economicStatusToInsert) {
    const exists = await repo.findOneBy({ level: economicStatus.level });
    if (!exists) {
      await repo.save(economicStatus);
      console.log(`Rol insertado: ${economicStatus.level}`);
    } else {
      console.log(`Rol ya existe: ${economicStatus.level}`);
    }
  }
};
