export type SuccessResponse<Data> = {
  message: string;
  data: Data | null;
};

export function createSuccessResponse<Data>(
  message: string,
  data: Data | null,
): SuccessResponse<Data> {
  return { message, data };
}
