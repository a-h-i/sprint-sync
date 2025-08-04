import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import type {User} from "./User";
import {TaskPriority, TaskStatus} from "@sprint-sync/enums";


@Entity(
    {
        name: 'task'
    }
)
export class Task {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'text', nullable: false})
    title!: string;

    @Column({type: 'text', nullable: true})
    description?: string | null;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.TODO,
        nullable: false
    })
    status!: TaskStatus;

    @Column({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.LOW,
        nullable: false
    })
    priority!: TaskPriority;

    @Column({ type: 'int', default: 0, nullable: false })
    total_minutes!: number;

    @Column({type: 'int', nullable: true})
    assigned_to_user_id?: number | null;

    @ManyToOne("User", (user: User) => user.assigned_tasks, {
        nullable: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    })
    @JoinColumn({ name: 'assigned_to_user_id'})
    assigned_to?: Promise<User | null>


    @Column({ type: 'timestamp', default: () => new Date() })
    created_at!: Date;

    @Column({ type: 'timestamp', default: () => new Date() })
    updated_at!: Date;

}