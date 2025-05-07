export function isErrorResponse(response: unknown): response is { type: 'error'; message: string } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'type' in response &&
    (response as any).type === 'error'
  );
}
