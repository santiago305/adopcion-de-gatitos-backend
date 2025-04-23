import { Role } from '../entities/role.entity';
import { DataSource } from 'typeorm';
import { RoleType } from '../../common/constants';

export const seedRoles = async (dataSource: DataSource) => {
  const repo = dataSource.getRepository(Role);

  const rolesToInsert = Object.values(RoleType).map((roleName) =>
    repo.create({ description: roleName })
  );

  for (const role of rolesToInsert) {
    const exists = await repo.findOneBy({ description: role.description });
    if (!exists) {
      await repo.save(role);
      console.log(`Rol insertado: ${role.description}`);
    } else {
      console.log(`Rol ya existe: ${role.description}`);
    }
  }
};
