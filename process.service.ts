import { v7 as uuidv7 } from 'uuid';
import { DeepPartial } from 'typeorm';
import { isEmpty } from 'lodash';
import {DataPointsService} from "./datapoints";
import {DevicesService} from "./devices";
import {SensorsService} from "./sensors";
import {SensorTypesService} from "./sensor-types";
import {DataPoint, Device, Sensor} from "./entities";
import {getTimezoneFromOffset} from "./utils";

export class ProcessService {

    constructor(
        private readonly dataPointsService: DataPointsService,
        private readonly deviceService: DevicesService,
        private readonly sensorService: SensorsService,
        private readonly sensorTypeService: SensorTypesService,
    ) {}

    async process(message: any) {

        const body = JSON.parse(message.body)

        const { isConnected, data, timezone, tzOffset } = body;

        let validTimezone;

        const { sensor, datapoint } = data;

        const vex: number = datapoint?.vex ? datapoint.vex : 5;

        console.warn(`Device ID of the datapoint: ${sensor.deviceId}`);

        if (isConnected) {
            console.log('Here to process connected datapoint');

            if (!isEmpty(data)) {
                const retrievedSensor = await this.sensorService.getSensorBySensorId(
                    sensor.sensorId,
                    sensor.deviceId,
                );

                if (!retrievedSensor) {
                    const sensorType = await this.sensorTypeService.findByName(
                        sensor.sensorType,
                    );

                    console.log(`Retrieved sensor type: ${sensorType}`);

                    if (sensorType) {
                        const dto: DeepPartial<Sensor> = {
                            id: uuidv7(),
                            deviceId: sensor.deviceId,
                            sensorTypeId: sensorType.id,
                            name: sensor.name,
                            sensorId: sensor.sensorId,
                        };

                        return await this.sensorService.add(dto);
                    }
                }

                if (retrievedSensor && datapoint) {
                    const timestamp = new Date(datapoint.timestamp);

                    console.log(`Sensor: ${JSON.stringify(retrievedSensor)}`)

                    if (!timezone) {
                        validTimezone = getTimezoneFromOffset(tzOffset);
                    } else {
                        validTimezone = timezone;
                    }

                    const retrievedDatapoint = await this.dataPointsService.getOne(
                        retrievedSensor.id,
                        timestamp,
                    );

                    console.log(
                        `This is retrieved datapoints: ${JSON.stringify(
                            retrievedDatapoint,
                        )}`,
                    );

                    let val;

                    console.log(`Original datapoint value: ${datapoint.value}`)

                    if (
                        sensor.units !== retrievedSensor.sensorType?.units ||
                        sensor.units === 'V'
                    ) {

                        console.log(`Original sensor units: ${sensor.units}`)
                        console.log(`Original sensor name: ${sensor.name}`)

                        if (sensor.units === 'F' || sensor.units === 'fahrenheit') {
                            val = (datapoint.value - 32) * (5 / 9);
                        } else if (sensor.units === 'millibar') {
                            val = datapoint.value / 10;
                        } else if (sensor.units === 'atm') {
                            val = datapoint.value * 14.696;
                        } else if (sensor.units === 'bar') {
                            val = datapoint.value * 14.503773773;
                        } else if (sensor.units === 'centibar') {
                            val = datapoint.value * 0.14503773800722;
                        } else if (sensor.units === 'km/h') {
                            val = datapoint.value * (10 / 36);
                        } else if (sensor.units === 'µm') {
                            val = datapoint.value / 1000;
                        } else if (sensor.units === 'inch') {
                            val = datapoint.value * 25.4;
                        } else if (sensor.units === 'direction') {
                            switch (datapoint.value) {
                                case 'N':
                                    val = (350 + 360 + 10) / 3;
                                    break;
                                case 'NNE':
                                    val = (20 + 30) / 2;
                                    break;
                                case 'NE':
                                    val = (40 + 50) / 2;
                                    break;
                                case 'ENE':
                                    val = (60 + 70) / 2;
                                    break;
                                case 'E':
                                    val = (80 + 90 + 100) / 3;
                                    break;
                                case 'ESE':
                                    val = (110 + 120) / 2;
                                    break;
                                case 'SE':
                                    val = (130 + 140) / 2;
                                    break;
                                case 'SSE':
                                    val = (150 + 160) / 2;
                                    break;
                                case 'S':
                                    val = (170 + 180 + 190) / 3;
                                    break;
                                case 'SSW':
                                    val = (200 + 210) / 2;
                                    break;
                                case 'SW':
                                    val = (220 + 230) / 2;
                                    break;
                                case 'WSW':
                                    val = (240 + 250) / 2;
                                    break;
                                case 'W':
                                    val = (260 + 270 + 280) / 3;
                                    break;
                                case 'WNW':
                                    val = (290 + 300) / 2;
                                    break;
                                case 'NW':
                                    val = (310 + 320) / 2;
                                    break;
                                case 'NNW':
                                    val = (330 + 340) / 2;
                                    break;
                            }

                            val = Math.round(val);
                        } else if (sensor.units === 'V') {
                            const vexValue = datapoint.value / vex;

                            if (sensor.name === 'Teros-10') {
                                val =
                                    100 *
                                    (4.824e-10 * Math.pow(1000 * datapoint.value, 3) -
                                        2.278e-6 * Math.pow(1000 * datapoint.value, 2) +
                                        3.898e-3 * (1000 * datapoint.value) -
                                        2.154);

                                if (val < 0) {
                                    val = 0;
                                }
                            } else if (
                                sensor.name === 'LT-4T-V1' ||
                                sensor.name === 'LT-4T'
                            ) {
                                val = datapoint.value * 25;
                            } else if (
                                sensor.name === 'DC1' ||
                                sensor.name === 'DD-L1' ||
                                sensor.name === 'DD-L1W' ||
                                sensor.name === 'DD-RO' ||
                                sensor.name === 'DD-S1' ||
                                sensor.name === 'DD-S2' ||
                                sensor.name === 'DD-S2W' ||
                                sensor.name === 'DD-S2W' ||
                                sensor.name === 'DR1' ||
                                sensor.name === 'DR1W' ||
                                sensor.name === 'DR3' ||
                                sensor.name === 'DR3W' ||
                                sensor.name === 'DR6' ||
                                sensor.name === 'DV' ||
                                sensor.name === 'DF5' ||
                                sensor.name === 'DF1'
                            ) {
                                val = (vexValue * 11000) / 1000;
                            } else if (
                                sensor.name === 'DR2' ||
                                sensor.name === 'DR7' ||
                                sensor.name === 'DF2' ||
                                sensor.name === 'DF6' ||
                                sensor.name === 'DD-L2' ||
                                sensor.name === 'DC3'
                            ) {
                                val = (vexValue * 25400) / 1000;
                            } else if (sensor.name === 'DC2') {
                                val = (vexValue * 15000) / 1000;
                            } else if (sensor.name === 'DF4') {
                                val = (vexValue * 150000) / 1000;
                            } else if (
                                sensor.name === 'DC4' ||
                                sensor.name === 'DD-L3' ||
                                sensor.name === 'DF3'
                            ) {
                                val = (vexValue * 50800) / 1000;
                            } else if (
                                sensor.name === 'HPT300-S2' ||
                                sensor.name.includes('Holykell')
                            ) {
                                val = datapoint.value * 14;
                            } else if (
                                sensor.name === 'LT-4T-V1' ||
                                sensor.name === 'LT-4T'
                            ) {
                                val = datapoint.value * 25;
                            } else if (sensor.name === 'DE-1M') {
                                val = datapoint.value * 5;
                            } else if (sensor.name === 'SD-5M') {
                                val = datapoint.value * 2.5;
                            } else if (
                                sensor.name === 'FI-S-PT' ||
                                sensor.name === 'FI-S'
                            ) {
                                val = 15.8 * datapoint.value + 7;
                            } else if (
                                sensor.name === 'FI-M-PT' ||
                                sensor.name === 'FI-M'
                            ) {
                                val = 31.25 * datapoint.value + 15;
                            } else if (
                                sensor.name === 'FI-L-PT' ||
                                sensor.name === 'FI-L'
                            ) {
                                val = 54.1 * datapoint.value + 30;
                            } else if (sensor.name === 'EC') {
                                val = datapoint.value * 12.5;
                            } else {
                                val = datapoint.value;
                            }
                        } else if (sensor.units === 'mV') {
                            datapoint.value *= 1000;

                            val =
                                100 *
                                (4.824 * 10 ** -10 * Math.pow(datapoint.value, 3) -
                                    2.278 * 10 ** -6 * Math.pow(datapoint.value, 2) +
                                    3.898 * 10 ** -3 * datapoint.value -
                                    2.154);

                            if (val < 0) {
                                val = 0;
                            }
                        } else {
                            val = datapoint.value;
                        }
                    } else {
                        val = datapoint.value;
                    }

                    const dto: Partial<DataPoint> = {
                        sensorId: retrievedSensor.id,
                        value: val,
                        timestamp,
                        timezone: validTimezone,
                    };

                    await this.dataPointsService.upsert(dto);
                }
            }
        } else {
            console.warn(
                `Device with id = ${sensor.deviceId} is not connected`,
            );
        }

        const dto: DeepPartial<Device> = {
            lastPollEndDate: Date.now(),
        };

        await this.deviceService.update(sensor.deviceId, dto);
    }
}
