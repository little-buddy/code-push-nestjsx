import {
  Column,
  // CreateDateColumn,
  // DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('versions')
export class Version {
  @PrimaryGeneratedColumn()
  id: number;

  /* 数据库版本 */
  @Column('int', {
    unique: true,
  })
  type: number;

  @Column('varchar')
  version: string;

  // @CreateDateColumn({ name: 'created_at' })
  // createdAt: Date;

  // @DeleteDateColumn({ name: 'deleted_at' })
  // deletedAt: Date;
}
