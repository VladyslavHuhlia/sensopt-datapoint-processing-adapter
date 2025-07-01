import {ProcessService} from "./process.service";
import {DataSource} from "typeorm";
import {DataPoint, Device, Sensor, SensorType} from "./entities";
import {DataPointsService} from "./datapoints";
import {DevicesService} from "./devices";
import {SensorsService} from "./sensors";
import {SensorTypesService} from "./sensor-types";

let dataSource: DataSource;

const getDataSource = async (): Promise<DataSource> => {
    if (!dataSource) {
        dataSource = new DataSource({
            type: "postgres",
            port: parseInt(process.env.POSTGRES_PORT as string, 10),
            username: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [DataPoint, Device, Sensor, SensorType],
            logging: ["error", "warn"],
            synchronize: false,
        });

        if (!dataSource.isInitialized) {
            await dataSource.initialize();
        }
    }

    return dataSource;
};

export const handler = async (event: any) => {

    console.log('Here to process')

    const ds = await getDataSource();

    const datapointService = new DataPointsService(ds);
    const devicesService = new DevicesService(ds);
    const sensorService = new SensorsService(ds);
    const sensorTypeService = new SensorTypesService(ds);

    const processService = new ProcessService(datapointService, devicesService, sensorService, sensorTypeService)

    const batchItemFailures: { itemIdentifier: string }[] = [];

    for (const record of event.Records) {
        try {
            await processService.process(record);
        } catch (error) {
            console.log(error.stack)
            batchItemFailures.push({ itemIdentifier: record.messageId });
        }
    }

    return { batchItemFailures };
};
