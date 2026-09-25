const IRAN_LOCAL_MOBILE_PATTERN = /^09\d{9}$/;
const IRAN_COUNTRY_MOBILE_PATTERN = /^989\d{9}$/;

const digitMap: Readonly<Record<string, string>> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

export function normalizePhoneNumber(phoneNumber: string): string {
  const normalizedDigits = normalizePhoneDigits(phoneNumber);
  const withoutInternationalPrefix = normalizedDigits.startsWith('00')
    ? `+${normalizedDigits.slice(2)}`
    : normalizedDigits;
  const withoutPlus = withoutInternationalPrefix.startsWith('+')
    ? withoutInternationalPrefix.slice(1)
    : withoutInternationalPrefix;

  if (IRAN_LOCAL_MOBILE_PATTERN.test(withoutPlus)) {
    return `+98${withoutPlus.slice(1)}`;
  }

  if (IRAN_COUNTRY_MOBILE_PATTERN.test(withoutPlus)) {
    return `+${withoutPlus}`;
  }

  return withoutInternationalPrefix;
}

export function normalizePhoneSearchQuery(query: string): string {
  const normalizedDigits = normalizePhoneDigits(query);
  const withoutInternationalPrefix = normalizedDigits.startsWith('00')
    ? `+${normalizedDigits.slice(2)}`
    : normalizedDigits;
  const withoutPlus = withoutInternationalPrefix.startsWith('+')
    ? withoutInternationalPrefix.slice(1)
    : withoutInternationalPrefix;

  if (/^09\d{0,9}$/.test(withoutPlus)) {
    return `+98${withoutPlus.slice(1)}`;
  }

  if (/^989\d{0,9}$/.test(withoutPlus)) {
    return `+${withoutPlus}`;
  }

  if (/^9\d{0,9}$/.test(withoutPlus)) {
    return `+98${withoutPlus}`;
  }

  return withoutInternationalPrefix;
}

function normalizePhoneDigits(value: string): string {
  return value
    .trim()
    .replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] ?? digit)
    .replace(/[\s()-]/g, '');
}
