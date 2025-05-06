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
    economicStatus: client.economicStatus?.level,
    role: client.user.role?.description,
    deleted: client.deleted,
  };
}

/**
 * Mapea los datos crudos de un cliente (en formato de fila de base de datos) 
 * a un formato adecuado para su uso en respuestas administrativas.
 * 
 * Esta función es utilizada cuando los datos de los clientes se obtienen directamente 
 * desde una consulta de la base de datos con `getRawMany()`. Convierte los resultados 
 * en un formato estructurado y coherente para ser utilizado en las respuestas de la API.
 * 
 * @param {Object} row - Un objeto que representa una fila de la base de datos, 
 * con los datos crudos del cliente obtenidos mediante una consulta SQL.
 * @returns {Object} Un objeto con los datos detallados del cliente, mapeados desde 
 * los resultados crudos de la consulta SQL.
 * 
 * @example
 * const clientRaw = {
 *   client_id: 1,
 *   user_name: 'Juan Pérez',
 *   user_email: 'juan.perez@example.com',
 *   client_address: '123 Calle Ficticia, Lima',
 *   client_phone: '+51 912 345 678',
 *   economicStatus_level: 'Bajo',
 *   role_description: 'USER',
 *   client_deleted: false
 * };
 * const mappedClient = mapClientListRaw(clientRaw);
 * console.log(mappedClient.role); // 'USER'
 */
export function mapClientListRaw(row: any) {
  return {
    id: row.client_id,
    name: row.user_name,
    email: row.user_email,
    address: row.client_address,
    phone: row.client_phone,
    economicStatus: row.economicStatus_level,
    role: row.role_description,
    deleted: !!row.client_deleted,  // Convierte el valor de `client_deleted` a booleano
  };
}