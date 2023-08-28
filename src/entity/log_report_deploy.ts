import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('log_report_deloy')
export class LogReportDeloy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('tinyint', { width: 3 })
  status: number;

  @Column('int', { width: 10 })
  packageId: number;

  @Column('varchar', { length: 100 })
  clientUniqueId: string;

  @Column('varchar', { length: 20 })
  previousLabel: string;

  @Column('varchar', { length: 64 })
  previousDeploymentKey: string;

  @CreateDateColumn()
  createdAt: Date;
}
