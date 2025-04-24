export const ANIMAL_ESTADO = ['En proceso', 'Confirmado', 'Rechazado'] as const;

export enum RoleType {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum EconomicStatusType {
  BAJO = 'Bajo',
  MEDIOBAJO = 'Medio Bajo',
  MEDIO = 'Medio',
  MEDIOALTO = 'Medio Alto',
  ALTO = 'Alto',
}