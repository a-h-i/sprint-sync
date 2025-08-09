import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Profile } from './Profile';
import type { Task } from './Task';
import * as argon2 from 'argon2';

/**
 * Model for holding authentication data.
 * Always save and update through typeorm methods to ensure password is hashed
 */
@Entity({ name: 'users' })
export class User {
  // id is required as username is not used as a primary key to allow users to change their usernames
  // without causing fk updates.
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: false })
  username!: string;

  @Column({ type: 'text', nullable: false })
  password_hash!: string;

  @Column({ type: 'timestamp', default: () => new Date() })
  created_at!: Date;

  @Column({ type: 'timestamp', default: () => new Date() })
  updated_at!: Date;

  @OneToOne('Profile', (profile: Profile) => profile.user)
  profile!: Promise<Profile>;

  @Column({ type: 'boolean', default: false, nullable: false })
  is_admin!: boolean;

  @OneToMany('Task', (task: Task) => task.assigned_to)
  assigned_tasks!: Promise<Task[]>;

  async hashPassword(password: string): Promise<void> {
    this.password_hash = await User.hashPassword(password);
  }

  async verifyPassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password_hash, password);
  }

  public static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  async serialize(){
    return {
      id: this.id,
      username: this.username,
      is_admin: this.is_admin,
      created_at: this.created_at.toISOString(),
      updated_at: this.updated_at.toISOString(),
      profile: await this.profile.then(p => p.serialize()),
    }
  }
}
