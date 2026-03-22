import { parse, format, isValid } from 'date-fns';

/**
 * Normalizes a date string into YYYY-MM-DD format.
 * Handles various common formats and returns an empty string if parsing fails.
 */
export function normalizeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';

  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // 1. Try native Date.parse (handles ISO, some common formats)
  const nativeDate = new Date(trimmed);
  if (isValid(nativeDate)) {
    return format(nativeDate, 'yyyy-MM-dd');
  }

  // 2. Try common formats with date-fns
  const formats = [
    'MMMM d, yyyy',
    'MMMM d yyyy',
    'MMM d, yyyy',
    'MMM d yyyy',
    'd MMMM yyyy',
    'd MMM yyyy',
    'dd/MM/yyyy',
    'dd-MM-yyyy',
    'MM/dd/yyyy',
    'MM-dd-yyyy',
    'yyyy/MM/dd',
    'yyyy-MM-dd',
    'd/M/yyyy',
    'M/d/yyyy',
    'yyyy.MM.dd',
    'dd.MM.yyyy'
  ];

  for (const fmt of formats) {
    try {
      const parsedDate = parse(trimmed, fmt, new Date());
      if (isValid(parsedDate)) {
        return format(parsedDate, 'yyyy-MM-dd');
      }
    } catch (e) {
      // Continue to next format
    }
  }

  // 3. Handle cases like "14 Oct 2025" or "Oct 14 2025" manually if needed
  // But native Date.parse often handles these.

  return '';
}
