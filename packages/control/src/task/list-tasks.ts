import {EntityManager} from "typeorm";
import {Task, TaskPriority, TaskStatus} from "@sprint-sync/storage";
import {z} from "zod";


interface TasksPage {
    tasks: Task[];
    nextPageToken: string | null;
}

const NextTokenSchema = z.object({
    id: z.number(),
    priority: z.enum([TaskPriority.LOW.toString(), TaskPriority.MEDIUM.toString(), TaskPriority.HIGH.toString()])
})

export async function listTasks(manager: EntityManager, options: {
    pageSize: number,
    status: TaskStatus,
    assignedToUserId?: number,
    nextPageToken?: string,
}): Promise<TasksPage> {
    let query = manager.createQueryBuilder()
        .select('task')
        .from(Task, 'task')
        .where('task.status = :status', {
            status: options.status,
        })
        .orderBy('task.priority', 'DESC')
        .addOrderBy('task.id', 'DESC')
        .limit(options.pageSize + 1);

    if (options.nextPageToken != null) {
        const jsonString = Buffer.from(options.nextPageToken, 'base64url').toString('utf-8');
        const parsedJson = JSON.parse(jsonString);
        const parsedToken = NextTokenSchema.parse(parsedJson);
        query = query.andWhere(
            '(task.priority, task.id) < (:priority, :id)',
            {
                priority: parsedToken.priority,
                id: parsedToken.id,
            }
        );
    }
    if (options.assignedToUserId != null) {
        query = query.andWhere('task.assigned_to_user_id = :assignedToUserId', {
            assignedToUserId: options.assignedToUserId,
        })
    }
    const tasks = await query.getMany();
    const page = tasks.slice(0, options.pageSize);
    if (tasks.length > options.pageSize) {
        const nextTokenString = JSON.stringify({
            id: page[page.length - 1].id,
            priority: page[page.length - 1].priority,
        });
        const encodedStr = Buffer.from(nextTokenString).toString('base64url');
        return {
            tasks: page,
            nextPageToken: encodedStr,
        }
    } else {
        return {
            tasks: page,
            nextPageToken: null,
        }
    }


}

