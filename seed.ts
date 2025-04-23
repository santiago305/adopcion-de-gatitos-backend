import { DataSource } from 'typeorm';
import { envs } from './src/config/envs';
import { Role } from './src/roles/entities/role.entity';
import { seedRoles } from './src/roles/seed/role.seeder';

const dataSource = new DataSource({
  type: 'mysql',
  host: envs.db.host,
  port: envs.db.port,
  username: envs.db.username,
  password: envs.db.password,
  database: envs.db.name,
  synchronize: false, // ya sincronizó antes
  logging: false,
  entities: [Role],
});

dataSource
  .initialize()
  .then(async () => {
    console.log('🌱 Iniciando seed...');
    await seedRoles(dataSource);
    await dataSource.destroy();
    console.log('✅ Seeding completo!');
  })
  .catch((err) => {
    console.error('❌ Error al hacer seed:', err);
  });
