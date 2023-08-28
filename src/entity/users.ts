import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 50 })
  username: string;

  @Column('varchar')
  password: string;

  @Column('varchar', { length: 100 })
  email: string;

  // TODO: 不清楚这个字符干嘛用的
  @Column('varchar', { length: 10, unique: true })
  identical: string;

  // TODO: 不清楚这个字符干嘛用的
  @Column('varchar', { length: 10 })
  ackCode: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
