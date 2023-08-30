import { Column, Entity } from 'typeorm';

import { UniEntity } from './abstract';

@Entity('deployments_versions')
export class DeploymentsVersions extends UniEntity {
  @Column('int', { width: 11 })
  deploymentId: number;

  @Column('varchar', { length: 100 })
  appVersion: string;

  @Column('int', { width: 10 })
  currentPackageId: number;

  @Column('bigint', { width: 20 })
  minVersion: number;

  @Column('bigint', { width: 20 })
  maxVersion: number;
}
