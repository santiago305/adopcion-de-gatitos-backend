export interface SuccessResponse<T = any> {
  type: 'success';
  message: string;
  data?: T;
}

export interface ErrorResponse {
  type: 'error';
  message: string;
}

export interface WarningResponse {
  type: 'warning';
  message: string;
}

export interface InfoResponse {
  type: 'info';
  message: string;
}
