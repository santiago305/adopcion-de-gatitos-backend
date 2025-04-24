import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { User } from '../entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';

/**
 * Seeder para insertar un usuario admin por defecto si no existe.
 */
export const seedUser = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const email = 'minecratf633@gmail.com';
  const password = '123123123';

  const existing = await userRepo.findOneBy({ email });
  if (existing) {
    console.log('🟡 Usuario ya existe, omitiendo...');
    return;
  }

  const role = await roleRepo.findOneBy({ id: 1 });
  if (!role) {
    throw new Error('❌ El rol con ID 1 no existe. Crea los roles primero.');
  }

  const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });

  const user = userRepo.create({
    name: 'Santiago',
    email,
    password: hashedPassword,
    role,
  });

  await userRepo.save(user);
  console.log('✅ Usuario Santiago creado exitosamente');
};
