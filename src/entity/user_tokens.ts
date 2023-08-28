import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_tokens')
export class UserTokens {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('bigint', { width: 20 })
  uid: number;

  @Column('varchar', { length: 50 })
  name: string;

  @Column('varchar', { length: 64 })
  tokens: string;

  // TODO: 用户登录跟 session 有啥关系
  @Column('tinyint', { width: 3 })
  isSession: number;

  @Column('varchar', { length: 64 })
  createdBy: string;

  // TODO: 用户的token为啥会有说明呀...
  @Column('varchar', { length: 500 })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('date', { nullable: true })
  expiresAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
