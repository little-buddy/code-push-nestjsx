import { Column, Entity } from 'typeorm';

import { UniEntity } from './abstract';

@Entity('deployments')
export class Deployments extends UniEntity {
  @Column('int', { width: 10 })
  appid: number;

  @Column('varchar', { length: 20 })
  name: string;

  @Column('varchar', { length: 500 })
  description: string;

  @Column('varchar', { length: 64 })
  deploymentKey: string;

  @Column('int', { width: 10 })
  lastDeploymentVersionId: number;

  @Column('int', { width: 11 })
  labelId: number;
}
