/**
 * Date utilities to handle local timezones correctly.
 * The application previously used toISOString() which forces UTC, causing issues
 * for users in western timezones (like EST) where it might be "tomorrow" in UTC.
 */

/**
 * Returns the date string in YYYY-MM-DD format based on the LOCAL system time.
 * @param date Optional Date object, defaults to now
 */
export const getLocalDate = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Returns the timestamp in ISO-like format but using local time components
 * format: YYYY-MM-DDTHH:mm:ss.sss
 */
export const getLocalISOString = (date: Date = new Date()): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Parses a YYYY-MM-DD string as a local date (midnight).
 * This avoids the default behavior of new Date('YYYY-MM-DD') which parses as UTC midnight.
 */
export const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    // Handle simplified ISO strings if necessary, but assuming YYYY-MM-DD
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return new Date(dateStr);
};
