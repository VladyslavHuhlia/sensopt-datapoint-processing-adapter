import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { DataPoint } from './data-point.entity';
import { Device } from './device.entity';
import { SensorType } from './sensor-type.entity';
import { Model } from './base/model.entity.base';

@Entity('sensors')
export class Sensor extends Model {
  @Column()
  name!: string;

  @Column({
    name: 'sensor_id',
    type: 'text',
  })
  sensorId!: string;

  @Column({
    name: 'device_id',
    type: 'uuid',
  })
  deviceId!: string;

  @Column({
    name: 'sensor_type_id',
    type: 'uuid',
  })
  sensorTypeId!: string;

  @Column({
    name: 'options',
    type: 'json',
    nullable: true,
  })
  options!: object;

  @ManyToOne(() => Device, (device) => device.sensors)
  @JoinColumn({ name: 'device_id' })
  device?: Device;

  @ManyToOne(() => SensorType, (st) => st.sensors)
  @JoinColumn({ name: 'sensor_type_id' })
  sensorType?: SensorType;

  @OneToMany(() => DataPoint, (dp) => dp.sensor, {
    cascade: true,
    eager: false,
    onDelete: 'CASCADE',
  })
  dataPoints?: DataPoint[];
}
