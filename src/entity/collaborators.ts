import { Column, Entity } from 'typeorm';
import { UniEntity } from './abstract';

@Entity('collaborators')
export class Collaborators extends UniEntity {
  @Column('int', { width: 20 })
  appid: number;

  @Column('bigint', { width: 20 })
  uid: number;

  @Column('varchar', { length: 20 })
  roles: string;
}
