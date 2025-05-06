export function mapClient(row: any) {
  return {
    id: row.client_id,
    name: row.user_name,
    email: row.user_email,
    phone: row.client_phone,
    birth_date: row.client_birth_date,
    gender: row.client_gender,
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
export function mapClientList(row: any) {
  return {
    id: row.client_id,
    name: row.user_name,
    email: row.user_email,
    phone: row.client_phone,
    birth_date: row.client_birth_date,
    gender: row.client_gender,
    role: row.role_description,
    deleted: !!row.client_deleted,  // Convierte el valor de `client_deleted` a booleano
  };
}