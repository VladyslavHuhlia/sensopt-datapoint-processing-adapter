import { PrimaryColumn } from 'typeorm';
import { Editable } from './editable.entity.base';

export abstract class Model extends Editable {
  @PrimaryColumn({
    type: 'uuid',
  })
  id!: string;
}
