import {DataSource, DeepPartial, FindOptionsWhere, Repository, UpdateResult} from "typeorm";
import {Device} from "../entities";

export class DevicesService {

    private repository: Repository<Device>

    constructor(dataSource: DataSource) {
        this.repository = dataSource.getRepository(Device)
    }

    async update(id: string, dto: DeepPartial<Device>) {

        const where: FindOptionsWhere<Device> = { id };

        try {
            await this.repository
                .createQueryBuilder()
                .update()
                .where(where)
                .set(dto)
                .execute()
        } catch (e: any) {
            console.error(e.stack)
            throw e
        }
    }
}