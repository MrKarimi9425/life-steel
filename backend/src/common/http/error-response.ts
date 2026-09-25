export type ErrorFields = Record<string, string>;

export type ApiError = {
  code: string;
  message?: string;
  fields?: ErrorFields;
};

export type ErrorResponse = {
  error: ApiError;
};
