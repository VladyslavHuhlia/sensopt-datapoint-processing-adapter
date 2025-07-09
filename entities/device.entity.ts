import { Column, Entity, OneToMany } from 'typeorm';
import { Sensor } from './sensor.entity';
import { Model } from './base/model.entity.base';

@Entity('devices')
export class Device extends Model {
  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @Column({
    type: 'uuid',
    name: 'device_type_id',
  })
  deviceTypeId!: string;

  @Column({
    name: 'is_activated',
    type: 'boolean',
    default: true,
  })
  isActivated!: boolean;

  @Column({
    type: 'text',
  })
  name!: string;

  @Column({
    type: 'jsonb',
  })
  connection!: object;

  @Column({
    name: 'poll_frequency',
    type: 'double precision',
    nullable: true,
  })
  pollFrequency?: number;

  @Column({
    name: 'last_poll_start_date',
    type: 'bigint',
    nullable: true,
  })
  lastPollStartDate?: number;

  @Column({
    name: 'last_poll_end_date',
    type: 'bigint',
    nullable: true,
  })
  lastPollEndDate?: number;

  @OneToMany(() => Sensor, (s) => s.device, {
    cascade: true,
    eager: false,
    onDelete: 'SET NULL',
  })
  sensors?: Sensor[];
}
