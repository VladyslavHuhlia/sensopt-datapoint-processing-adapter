import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

import { Editable } from './base/editable.entity.base';
import { Sensor } from './sensor.entity';

@Index('IDX_data_points_sensor_id_timestamp', ['sensorId', 'timestamp'], {
  unique: true,
})
@Entity('data_points')
export class DataPoint extends Editable {
  @PrimaryColumn({
    name: 'sensor_id',
    type: 'text',
  })
  sensorId!: string;

  @PrimaryColumn({
    name: 'timestamp',
    type: 'timestamp with time zone',
  })
  timestamp!: Date;

  @Column({
    name: 'timezone',
    type: 'text',
  })
  timezone!: string;

  @Column({
    type: 'jsonb',
  })
  value!: any;

  @Column({
    name: 'extended_props',
    type: 'jsonb',
    nullable: true,
  })
  extendedProps?: object;

  @ManyToOne(() => Sensor, (sensor) => sensor.dataPoints)
  @JoinColumn({ name: 'sensor_id' })
  sensor?: Sensor;
}
