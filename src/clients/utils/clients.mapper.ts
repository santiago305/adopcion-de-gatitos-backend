import { Client } from '../entities/client.entity';

/**
 * Mapea un cliente para respuestas públicas de perfil.
 * 
 * Esta función transforma la entidad `Client` en un formato adecuado para ser usado en 
 * respuestas públicas, como por ejemplo, en el endpoint `/clients/me`, donde solo se
 * deben mostrar los detalles del cliente de manera pública y segura.
 * 
 * @param {Client} client - La entidad cliente a mapear.
 * @returns {Object} Un objeto con los datos públicos del cliente.
 * 
 * @example
 * const clientProfile = mapClient(client);
 * console.log(clientProfile.name); // Nombre del cliente
 */
export function mapClient(client: Client) {
  return {
    id: client.id,
    name: client.user.name,
    email: client.user.email,
    address: client.address,
    phone: client.phone,
    economicStatus: client.economicStatus?.level ?? null,
  };
}

/**
 * Mapea una lista de clientes para uso administrativo.
 * 
 * Esta función transforma la entidad `Client` en un formato adecuado para ser usado en
 * respuestas administrativas. Proporciona detalles adicionales como el rol del usuario 
 * y el estado de eliminación del cliente.
 * 
 * @param {Client} client - La entidad cliente a mapear.
 * @returns {Object} Un objeto con los datos detallados del cliente para uso administrativo.
 * 
 * @example
 * const adminClientData = mapClientList(client);
 * console.log(adminClientData.role); // Rol del cliente
 */
export function mapClientList(client: Client) {
  return {
    id: client.id,
    name: client.user.name,
    email: client.user.email,
    address: client.address,
    phone: client.phone,
    economicStatus: client.economicStatus?.level ?? null,
    role: client.user.role?.description ?? null,
    deleted: client.deleted,
  };
}
