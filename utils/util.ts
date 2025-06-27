declare namespace Intl {
    type Key =
        | 'calendar'
        | 'collation'
        | 'currency'
        | 'numberingSystem'
        | 'timeZone'
        | 'unit';

    function supportedValuesOf(input: Key): string[];
}

const getOffset = (timeZone = 'UTC', date = new Date()) => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    return (tzDate.getTime() - utcDate.getTime()) / 6e4;
};

export function getTimezoneFromOffset(offsetMinutes: number): string | null {
    const timezones = Intl.supportedValuesOf('timeZone');

    for (const tz of timezones) {
        const zoneOffset = getOffset(tz);
        if (zoneOffset === offsetMinutes) {
            return tz;
        }
    }

    return null;
}