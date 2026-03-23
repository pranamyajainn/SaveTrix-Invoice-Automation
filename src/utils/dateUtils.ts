import { parse, format, isValid } from 'date-fns';

/**
 * Checks if a value is "null-like" (null, undefined, "null", "N/A", "none", "", etc.)
 */
export function isNullLike(val: any): boolean {
  if (val === null || val === undefined) return true;
  const s = String(val).trim().toLowerCase();
  return s === '' || s === 'null' || s === 'n/a' || s === 'none' || s === 'undefined' || s === 'nil';
}

/**
 * Normalizes a date string into YYYY-MM-DD format.
 * Handles various common formats and returns an empty string if parsing fails.
 */
export function normalizeDate(dateStr: string | null | undefined): string {
  if (isNullLike(dateStr)) return '';

  const trimmed = dateStr!.trim();
  
  // 1. Try native Date.parse (handles ISO, some common formats like "October 14, 2025")
  const nativeDate = new Date(trimmed);
  if (isValid(nativeDate) && !isNaN(nativeDate.getTime())) {
    return format(nativeDate, 'yyyy-MM-dd');
  }

  // 2. Try common formats with date-fns
  // Note: For ambiguous formats like 10/14/2025 vs 14/10/2025, we try to be smart.
  const formats = [
    'MMMM d, yyyy',
    'MMMM d yyyy',
    'MMM d, yyyy',
    'MMM d yyyy',
    'd MMMM yyyy',
    'd MMM yyyy',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'dd-MM-yyyy',
    'MM-dd-yyyy',
    'yyyy/MM/dd',
    'yyyy-MM-dd',
    'd/M/yyyy',
    'M/d/yyyy',
    'yyyy.MM.dd',
    'dd.MM.yyyy',
    'd MMM yy',
    'MMM d yy'
  ];

  for (const fmt of formats) {
    try {
      const parsedDate = parse(trimmed, fmt, new Date());
      if (isValid(parsedDate) && !isNaN(parsedDate.getTime())) {
        // Check if the year is reasonable (e.g., between 1900 and 2100)
        const year = parsedDate.getFullYear();
        if (year > 1900 && year < 2100) {
          return format(parsedDate, 'yyyy-MM-dd');
        }
      }
    } catch (e) {
      // Continue to next format
    }
  }

  // 3. Manual regex for some tricky ones if needed
  // Handle DD.MM.YYYY specifically if not caught
  const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (dotMatch) {
    const d = dotMatch[1].padStart(2, '0');
    const m = dotMatch[2].padStart(2, '0');
    const y = dotMatch[3];
    return `${y}-${m}-${d}`;
  }

  return '';
}
