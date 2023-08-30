import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class PackagesMetrics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { width: 10 })
  packageId: number;

  @Column('int', { width: 10 })
  active: number;

  @Column('int', { width: 10 })
  downloaded: number;

  @Column('int', { width: 10 })
  failed: number;

  @Column('int', { width: 10 })
  installed: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
