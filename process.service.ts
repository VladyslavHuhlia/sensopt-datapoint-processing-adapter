import { v7 as uuidv7 } from 'uuid';
import { DeepPartial } from 'typeorm';
import { isEmpty } from 'lodash';
import {DataPointsService} from "./datapoints";
import {DevicesService} from "./devices";
import {SensorsService} from "./sensors";
import {SensorTypesService} from "./sensor-types";
import {DataPoint, Device, Sensor} from "./entities";
import {convertDatapointValue, getTimezoneFromOffset} from "./utils";
import {ConvertValue} from "./interfaces";

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

                    if (
                        sensor.units !== retrievedSensor.sensorType?.units ||
                        sensor.units === 'V'
                    ) {

                        const data: ConvertValue = {
                            value: datapoint.value,
                            sensorName: sensor.name,
                            sensorUnits: sensor.units,
                            vex
                        }

                        val = convertDatapointValue(data)

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
