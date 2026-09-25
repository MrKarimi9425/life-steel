import { BadRequestException, type ValidationError } from '@nestjs/common';

const constraintMessages: Record<string, string> = {
  arrayMaxSize: 'تعداد موارد این فیلد بیش از حد مجاز است.',
  arrayMinSize: 'تعداد موارد این فیلد کمتر از حد مجاز است.',
  isArray: 'مقدار این فیلد باید فهرست باشد.',
  isBoolean: 'مقدار این فیلد باید درست یا نادرست باشد.',
  isDateString: 'تاریخ واردشده معتبر نیست.',
  isEnum: 'یکی از گزینه های معتبر را انتخاب کنید.',
  isInt: 'مقدار این فیلد باید عدد صحیح باشد.',
  isNotEmpty: 'وارد کردن این فیلد الزامی است.',
  isNumber: 'مقدار این فیلد باید عدد باشد.',
  isString: 'مقدار این فیلد باید متن باشد.',
  isUrl: 'نشانی واردشده معتبر نیست.',
  isUuid: 'شناسه ارسال شده معتبر نیست.',
  matches: 'فرمت این فیلد معتبر نیست.',
  max: 'مقدار این فیلد بیشتر از حد مجاز است.',
  maxLength: 'مقدار این فیلد طولانی تر از حد مجاز است.',
  min: 'مقدار این فیلد کمتر از حد مجاز است.',
  minLength: 'مقدار این فیلد کوتاه تر از حد مجاز است.',
  whitelistValidation: 'ارسال این فیلد مجاز نیست.',
};

export function createValidationException(
  validationErrors: ValidationError[],
): BadRequestException {
  return new BadRequestException({
    code: 'VALIDATION_ERROR',
    fields: collectFields(validationErrors),
  });
}

function collectFields(
  validationErrors: ValidationError[],
  parentPath?: string,
): Record<string, string> {
  return validationErrors.reduce<Record<string, string>>((result, error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const constraint = Object.keys(error.constraints ?? {})[0];

    if (constraint) {
      result[path] =
        constraintMessages[constraint] ?? 'مقدار این فیلد معتبر نیست.';
    }

    Object.assign(result, collectFields(error.children ?? [], path));
    return result;
  }, {});
}
