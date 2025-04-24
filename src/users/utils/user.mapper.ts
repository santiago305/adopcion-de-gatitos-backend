import { User } from '../entities/user.entity';

/**
 * Mapea un objeto `User` para retornar únicamente datos públicos básicos.
 *
 * Esta función es útil para respuestas de autenticación o información de perfil
 * donde no se necesita mostrar el `id`, estado de eliminación ni contraseña.
 *
 * @param user - Entidad de tipo `User`.
 * @returns Un objeto con nombre, email y descripción del rol.
 */
export function mapUser(user: User) {
  return {
    name: user.name,
    email: user.email,
    role: user.role?.description,
  };
}

/**
 * Mapea un objeto `User` para mostrar una vista más completa del usuario,
 * útil para listados administrativos o reportes.
 *
 * Incluye el `id`, nombre, email, estado (`deleted`) y descripción del rol.
 *
 * @param user - Entidad de tipo `User`.
 * @returns Un objeto detallado del usuario.
 */
export function mapUserList(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    deleted: user.deleted,
    role: user.role?.description,
  };
}
