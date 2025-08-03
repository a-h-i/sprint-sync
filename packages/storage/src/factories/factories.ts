import FactoryGirl from 'factory-girl';
import { faker } from '@faker-js/faker';
import { Profile, User } from '../models';

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

export { FactoryGirl };
