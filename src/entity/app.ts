import { Column, Entity } from 'typeorm';

import { UniEntity } from './abstract';

@Entity('apps')
export class App extends UniEntity {
  @Column('varchar', { length: 50 })
  name: string;

  @Column('bigint', { width: 20 })
  uid: number;

  @Column('tinyint', { width: 3 })
  os: number;

  @Column('tinyint', { width: 3 })
  platform: number;

  @Column('tinyint', { width: 3 })
  isUseDiffTtext: number;
}
