import { Column } from 'typeorm';

import { UniEntity } from './abstract';

export class PackagesDiff extends UniEntity {
  @Column('int', { width: 11 })
  packageId: number;

  @Column('varchar', { length: 64 })
  diffAgainstPackageHash: string;

  @Column('varchar', { length: 255 })
  diffBlobUrl: string;

  @Column('int', { width: 11 })
  diffSize: string;
}
