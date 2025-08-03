import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import type { User } from './User';

@Entity({
  name: 'profiles',
})
export class Profile {
  @PrimaryColumn({ type: 'int' })
  user_id!: number;

  @OneToOne('User', (user: User) => user.profile)
  @JoinColumn({ name: 'user_id' })
  user!: Promise<User>;

  @Column({ type: 'text', nullable: false })
  first_name!: string;

  @Column({ type: 'text', nullable: false })
  last_name!: string;

  @Column({ type: 'timestamp', default: () => new Date() })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => new Date() })
  updated_at!: Date;
}
