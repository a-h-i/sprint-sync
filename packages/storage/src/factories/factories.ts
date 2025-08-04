import FactoryGirl from 'factory-girl';
import {faker} from '@faker-js/faker';
import {Profile, Task, TaskPriority, TaskStatus, User} from '../models';



function randomTaskPriority(): TaskPriority {
    const values = [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH];
    const index = Math.floor(Math.random() * values.length);
    return values[index];
}

FactoryGirl.define<User>(
  'User',
  User,
  {
    password_hash: '$argon2id$v=19$m=65536,t=3,p=4$u+Gcc8tDqnefJIF/1YhzLQ$snrrA74SUZEFfptPa5lWC5POJ37rjd3ezWzl0dNOZfY', // password is password
    username: FactoryGirl.seq(
      'User.username',
      (number) => `${faker.internet.username()}_${number}`,
    ),
    is_admin: false,
  },
);

FactoryGirl.define<Profile>('Profile', Profile, {
  first_name: () => faker.person.firstName(),
  last_name: () => faker.person.lastName(),
  user_id: FactoryGirl.assoc('User', 'id'),
});

FactoryGirl.define<Task>('Task', Task, {
    description: () => faker.lorem.paragraph(),
    title: () => faker.lorem.sentence(),
    total_minutes: 0,
    status: TaskStatus.TODO,
    priority: () => randomTaskPriority(),
});



export { FactoryGirl };
