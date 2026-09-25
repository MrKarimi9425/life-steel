import {
  normalizePhoneNumber,
  normalizePhoneSearchQuery,
} from './phone-number.util';

describe('normalizePhoneNumber', () => {
  it.each([
    ['09038169425', '+989038169425'],
    ['989038169425', '+989038169425'],
    ['00989038169425', '+989038169425'],
    ['+98 903 816 9425', '+989038169425'],
    ['۰۹۰۳۸۱۶۹۴۲۵', '+989038169425'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });

  it('preserves an already normalized non-Iranian number', () => {
    expect(normalizePhoneNumber('+10000000000')).toBe('+10000000000');
  });

  it.each([
    ['0912', '+98912'],
    ['912', '+98912'],
    ['98912', '+98912'],
    ['+98912', '+98912'],
    ['۰۹۱۲', '+98912'],
  ])('normalizes partial search %s to %s', (input, expected) => {
    expect(normalizePhoneSearchQuery(input)).toBe(expected);
  });

  it('preserves a non-phone search query', () => {
    expect(normalizePhoneSearchQuery('امیر')).toBe('امیر');
  });
});
