import {DataSource, DeepPartial, FindOptionsWhere, QueryRunner, Repository} from "typeorm";
import {DataPoint} from "../entities";

export class DataPointsService {

    private repository: Repository<DataPoint>

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(DataPoint)
    }

    async upsert(dto: DeepPartial<DataPoint>) {
        const builder = this.repository.createQueryBuilder('dp');

        try {
            await builder
                .insert()
                .values(dto)
                .orUpdate([`timezone`, `value`, `timestamp`], [`sensor_id`, `timestamp`])
                .execute();
        } catch (e) {
            throw e;
        }
    }

    async getOne(
        sensorId: string,
        timestamp: Date,
        runner?: QueryRunner,
    ): Promise<DataPoint | null> {
        const builder = this.repository.createQueryBuilder('dp');

        const where: FindOptionsWhere<DataPoint> = {
            sensorId,
            timestamp,
        };

        if (runner) {
            builder.setQueryRunner(runner).useTransaction(true);
        }

        try {
            return await builder.where(where).getOne();
        } catch (e) {
            throw e;
        }
    }
}