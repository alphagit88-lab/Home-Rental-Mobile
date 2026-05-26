const padTwoDigits = (value: number) => String(value).padStart(2, '0');

const buildIsoDate = (year: number, month: number, day: number) => {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const isoDate = `${String(year).padStart(4, '0')}-${padTwoDigits(month)}-${padTwoDigits(
    day,
  )}`;
  const parsed = new Date(`${isoDate}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
    ? isoDate
    : null;
};

const normalizeYear = (value: string) => {
  const parsedYear = Number(value);

  if (!Number.isInteger(parsedYear)) {
    return NaN;
  }

  return value.length === 2 ? 2000 + parsedYear : parsedYear;
};

const parseYearMonthDay = (year: string, month: string, day: string) =>
  buildIsoDate(normalizeYear(year), Number(month), Number(day));

const parseDayMonthYear = (day: string, month: string, year: string) =>
  buildIsoDate(normalizeYear(year), Number(month), Number(day));

const formatDigitsWithDelimiter = (
  digits: string,
  segmentLengths: number[],
  delimiter: string,
) => {
  const segments: string[] = [];
  let startIndex = 0;

  segmentLengths.forEach(length => {
    const segment = digits.slice(startIndex, startIndex + length);

    if (segment.length > 0) {
      segments.push(segment);
    }

    startIndex += length;
  });

  return segments.join(delimiter);
};

export const normalizeDateString = (value?: string | null) => {
  const normalizedValue = String(value ?? '').trim();

  if (normalizedValue.length === 0) {
    return null;
  }

  const yearFirstMatch = normalizedValue.match(
    /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})(?:$|[T\s].*)/,
  );

  if (yearFirstMatch) {
    return parseYearMonthDay(
      yearFirstMatch[1],
      yearFirstMatch[2],
      yearFirstMatch[3],
    );
  }

  const dayFirstMatch = normalizedValue.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})(?:$|[T\s].*)/,
  );

  if (dayFirstMatch) {
    return parseDayMonthYear(dayFirstMatch[1], dayFirstMatch[2], dayFirstMatch[3]);
  }

  const digitsOnly = normalizedValue.replace(/\D/g, '');

  if (digitsOnly.length === 8) {
    const yearFirst = Number(digitsOnly.slice(0, 4));

    if (yearFirst >= 1000 && yearFirst <= 2999) {
      const yearFirstDate = parseYearMonthDay(
        digitsOnly.slice(0, 4),
        digitsOnly.slice(4, 6),
        digitsOnly.slice(6, 8),
      );

      if (yearFirstDate) {
        return yearFirstDate;
      }
    }

    return parseDayMonthYear(
      digitsOnly.slice(0, 2),
      digitsOnly.slice(2, 4),
      digitsOnly.slice(4, 8),
    );
  }

  if (digitsOnly.length === 6) {
    return parseDayMonthYear(
      digitsOnly.slice(0, 2),
      digitsOnly.slice(2, 4),
      digitsOnly.slice(4, 6),
    );
  }

  return null;
};

export const formatShortDateInput = (value?: string | null) => {
  const normalizedDate = normalizeDateString(value);

  if (normalizedDate) {
    const [year, month, day] = normalizedDate.split('-');
    return `${day}/${month}/${year.slice(-2)}`;
  }

  const digitsOnly = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 6);

  return formatDigitsWithDelimiter(digitsOnly, [2, 2, 2], '/');
};

export const formatIsoDateInput = (value?: string | null) => {
  const normalizedDate = normalizeDateString(value);

  if (normalizedDate) {
    return normalizedDate;
  }

  const digitsOnly = String(value ?? '')
    .replace(/\D/g, '')
    .slice(0, 8);

  return formatDigitsWithDelimiter(digitsOnly, [4, 2, 2], '-');
};
