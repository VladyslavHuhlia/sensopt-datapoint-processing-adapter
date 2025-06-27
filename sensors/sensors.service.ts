import {DataSource, DeepPartial, FindOptionsWhere, QueryRunner, Repository} from "typeorm";

import {Sensor} from "../entities";

export class SensorsService {

    private repository: Repository<Sensor>

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Sensor)
    }

    async getSensorBySensorId(
        sensorId: string,
        deviceId: string,
        runner?: QueryRunner,
    ) {
        const builder = this.repository.createQueryBuilder('s');

        console.log('SensorsService.getSensorBySensorId', { sensorId });

        try {
            const where: FindOptionsWhere<Sensor> = {
                sensorId,
                deviceId,
            };

            if (runner) {
                builder.setQueryRunner(runner).useTransaction(true);
            }

            builder.withDeleted();

            builder.leftJoinAndSelect('s.sensorType', 'st');

            return await builder.where(where).getOne();
        } catch (e) {
            console.log('SensorsService.getSensorById failed with error', {
                error: e,
            });
            throw e
        }
    }


    async add(dto: DeepPartial<Sensor>) {
        try {
            await this.repository
                .createQueryBuilder()
                .insert()
                .values(dto)
                .orUpdate([`name`, `sensor_type_id`], [`device_id`, `sensor_id`])
                .execute();
        } catch (e) {
            console.log(e);
            throw e
        }
    }
}