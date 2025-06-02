import { status } from "../constants";
import { SuccessResponse } from "../interfaces/response.interface";

export type ErrorResponse =
  | { type: status.ERROR; message: string }
  | { type: status.INVALID; message: string }
  | { type: status.UNAUTHORIZED; message: string }
  | { type: status.WARNING; message: string };

export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'type' in response &&
    [
      status.ERROR,
      status.INVALID,
      status.UNAUTHORIZED,
      status.WARNING
    ].includes((response as any).type)
  );
}

export function isSuccessResponse<T = any>(
  response: unknown
): response is SuccessResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'type' in response &&
    (response as any).type === status.SUCCESS
  );
}