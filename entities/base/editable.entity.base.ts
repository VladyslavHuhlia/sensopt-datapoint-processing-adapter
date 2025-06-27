import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class Editable {
  @CreateDateColumn({
    name: 'created_at',
    default: 'now()',
  })
  createdAt!: string;

  @UpdateDateColumn({
    name: 'updated_at',
    default: 'now()',
    onUpdate: 'now()',
  })
  updatedAt!: string;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  deletedAt!: string | null;
}
