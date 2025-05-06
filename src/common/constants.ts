export const ANIMAL_ESTADO = ['En proceso', 'Confirmado', 'Rechazado'] as const;

export enum RoleType {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

export enum EconomicStatusType {
  NINGUNO = 'Ninguno',
  BAJO = 'Bajo',
  MEDIOBAJO = 'Medio Bajo',
  MEDIO = 'Medio',
  MEDIOALTO = 'Medio Alto',
  ALTO = 'Alto',
}

export enum status {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  UNAUTHORIZED = 'unauthorized',
  INVALID = 'invalid',
}