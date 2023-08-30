import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('log_report_download')
export class LogReportDownload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  package_id: number;

  @Column()
  client_qnique_id: string;

  @CreateDateColumn()
  created_at: Date;
}
