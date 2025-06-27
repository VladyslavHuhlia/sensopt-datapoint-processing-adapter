import {DataSource, FindOptionsWhere, Repository} from "typeorm";
import {SensorType} from "../entities";

export class SensorTypesService {

    private repository: Repository<SensorType>

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(SensorType)
    }

    async findByName(name: string) {
        const builder = this.repository.createQueryBuilder('st');

        const where: FindOptionsWhere<SensorType> = {
            name,
        };

        try {
            return await builder.where(where).getOne();
        } catch (e) {
            throw e;
        }
    }
}