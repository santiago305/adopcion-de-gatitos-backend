import { User } from '../entities/user.entity';
    /**
   * Mapea un objeto `User` a una versión segura para exponer.
   * @param user Entidad de usuario
   * @returns Usuario mapeado sin contraseña y con rol simplificado
   */
export function mapUser(user: User) {
  return {
    name: user.name,
    email: user.email,
    role: user.role?.description,
  };
}

export function mapUserList(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    deleted: user.deleted,
    role: user.role?.description,
  };
}