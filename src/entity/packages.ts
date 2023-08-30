import { Column, Entity } from 'typeorm';

import { UniEntity } from './abstract';

@Entity('packages')
export class Packages extends UniEntity {
  @Column('int', { width: 10 })
  deploymentVersionId: number;

  @Column('int', { width: 10 })
  deploymentId: number;

  @Column('varchar', { length: 500 })
  description: string;

  @Column('varchar', { length: 64 })
  packageHash: string;

  @Column()
  blobUrl: string;

  @Column('int', { width: 11 })
  size: number;

  @Column()
  manifestBlobUrl: string;

  @Column('varchar', { length: 20 })
  releaseMethos: string;

  @Column('varchar', { length: 20 })
  label: string;

  @Column('varchar', { length: 20 })
  originalLabel: string;

  @Column('varchar', { length: 20 })
  originalDeployment: string;

  @Column('bigint', { width: 20 })
  releasedBy: string;

  @Column('tinyint', { width: 3 })
  isMandatory: number;

  @Column('tinyint', { width: 3 })
  isDisabled: number;

  @Column('tinyint', { width: 3 })
  rollout: number;
}
