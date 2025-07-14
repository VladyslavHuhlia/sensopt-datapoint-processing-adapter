import {ConvertValue} from "../interfaces";
import {windDirection} from "../constants";

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

export function convertDatapointValue(data: ConvertValue): any {
    
    let {value, sensorUnits, sensorName, vex} = data

    if (sensorUnits === 'F' || sensorUnits === 'fahrenheit') {
        value = (value - 32) * (5 / 9);
    } else if (sensorUnits === 'millibar') {
        value = value / 10;
    } else if (sensorUnits === 'atm') {
        value = value * 14.696;
    } else if (sensorUnits === 'bar') {
        value = value * 14.503773773;
    } else if (sensorUnits === 'centibar') {
        value = value * 0.14503773800722;
    } else if (sensorUnits === 'km/h') {
        value = value * (10 / 36);
    } else if (sensorUnits === 'µm') {
        value = value / 1000;
    } else if (sensorUnits === 'inch') {
        value = value * 25.4;
    } else if (sensorUnits === 'direction') {
        value = Math.round(windDirection[value]);
    } else if (sensorUnits === 'V') {
        const vexValue = value / vex;

        if (sensorName === 'Teros-10') {
            const convertedVal = 100 *
                (4.824e-10 * Math.pow(1000 * value, 3) -
                    2.278e-6 * Math.pow(1000 * value, 2) +
                    3.898e-3 * (1000 * value) -
                    2.154)

            value = convertedVal < 0 ? 0 : convertedVal
        } else if (
            sensorName === 'LT-4T-V1' ||
            sensorName === 'LT-4T'
        ) {
            value = value * 25;
        } else if (
            sensorName === 'DC1' ||
            sensorName === 'DD-L1' ||
            sensorName === 'DD-L1W' ||
            sensorName === 'DD-RO' ||
            sensorName === 'DD-S1' ||
            sensorName === 'DD-S2' ||
            sensorName === 'DD-S2W' ||
            sensorName === 'DD-S2W' ||
            sensorName === 'DR1' ||
            sensorName === 'DR1W' ||
            sensorName === 'DR3' ||
            sensorName === 'DR3W' ||
            sensorName === 'DR6' ||
            sensorName === 'DV' ||
            sensorName === 'DF5' ||
            sensorName === 'DF1'
        ) {
            value = (vexValue * 11000) / 1000;
        } else if (
            sensorName === 'DR2' ||
            sensorName === 'DR7' ||
            sensorName === 'DF2' ||
            sensorName === 'DF6' ||
            sensorName === 'DD-L2' ||
            sensorName === 'DC3'
        ) {
            value = (vexValue * 25400) / 1000;
        } else if (sensorName === 'DC2') {
            value = (vexValue * 15000) / 1000;
        } else if (sensorName === 'DF4') {
            value = (vexValue * 150000) / 1000;
        } else if (
            sensorName === 'DC4' ||
            sensorName === 'DD-L3' ||
            sensorName === 'DF3'
        ) {
            value = (vexValue * 50800) / 1000;
        } else if (
            sensorName === 'HPT300-S2' ||
            sensorName.includes('Holykell')
        ) {
            value = value * 14;
        } else if (
            sensorName === 'LT-4T-V1' ||
            sensorName === 'LT-4T'
        ) {
            value = value * 25;
        } else if (sensorName === 'DE-1M') {
            value = value * 5;
        } else if (sensorName === 'SD-5M') {
            value = value * 2.5;
        } else if (
            sensorName === 'FI-S-PT' ||
            sensorName === 'FI-S'
        ) {
            value = 15.8 * value + 7;
        } else if (
            sensorName === 'FI-M-PT' ||
            sensorName === 'FI-M'
        ) {
            value = 31.25 * value + 15;
        } else if (
            sensorName === 'FI-L-PT' ||
            sensorName === 'FI-L'
        ) {
            value = 54.1 * value + 30;
        } else if (sensorName === 'EC') {
            value = value * 12.5;
        }
    } else if (sensorUnits === 'mV') {
        value *= 1000;

        const convertedVal = 100 *
            (4.824 * 10 ** -10 * Math.pow(value, 3) -
                2.278 * 10 ** -6 * Math.pow(value, 2) +
                3.898 * 10 ** -3 * value -
                2.154);

        value = convertedVal < 0 ? 0 : convertedVal
    }

    return value
}