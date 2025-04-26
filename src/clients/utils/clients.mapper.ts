import { Client } from '../entities/client.entity';

/**
 * Mapea un cliente para respuestas públicas de perfil.
 * 
 * Ideal para endpoints como `/clients/me`.
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
 * Incluye campos como id, rol del usuario y estado eliminado.
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


