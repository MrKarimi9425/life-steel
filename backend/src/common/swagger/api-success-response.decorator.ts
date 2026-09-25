import { applyDecorators, type Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  getSchemaPath,
  type ApiResponseOptions,
} from '@nestjs/swagger';
import { SuccessResponseDto } from '../dto/success-response.dto';

type ApiSuccessResponseOptions = {
  status: number;
  description: string;
  dataType?: Type<unknown>;
  isArray?: boolean;
  headers?: ApiResponseOptions['headers'];
};

export function ApiSuccessResponse(
  options: ApiSuccessResponseOptions,
): MethodDecorator {
  const models = options.dataType
    ? [SuccessResponseDto, options.dataType]
    : [SuccessResponseDto];
  const dataSchema = options.dataType
    ? options.isArray
      ? {
          type: 'array' as const,
          items: { $ref: getSchemaPath(options.dataType) },
          nullable: true,
        }
      : {
          allOf: [{ $ref: getSchemaPath(options.dataType) }],
          nullable: true,
        }
    : {
        type: 'object' as const,
        nullable: true,
        example: null,
      };

  return applyDecorators(
    ApiExtraModels(...models),
    ApiResponse({
      status: options.status,
      description: options.description,
      headers: options.headers,
      schema: {
        allOf: [
          { $ref: getSchemaPath(SuccessResponseDto) },
          { properties: { data: dataSchema } },
        ],
      },
    }),
  );
}
