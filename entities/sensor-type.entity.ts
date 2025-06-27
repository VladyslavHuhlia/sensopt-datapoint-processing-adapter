import { Column, Entity, OneToMany } from 'typeorm';
import { Sensor } from './sensor.entity';
import { Model } from './base/model.entity.base';

@Entity('sensor_types')
export class SensorType extends Model {
  @Column({
    type: 'text',
    unique: true,
  })
  name!: string;

  @Column({
    type: 'text',
  })
  units!: string;

  @OneToMany(() => Sensor, (sensor) => sensor.sensorType, {
    cascade: true,
    eager: false,
    onDelete: 'NO ACTION',
  })
  sensors?: Sensor[];
}
