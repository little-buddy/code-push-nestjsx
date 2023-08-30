import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('deployments_history')
export class DeploymentsHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { width: 11 })
  deploymentId: number;

  @Column('int', { width: 10 })
  packageId: number;

  @CreateDateColumn()
  createdId: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
