import {
  FactoryGirlTypeOrmAdapter,
  setupPostgres,
  FactoryGirl,
  User,
} from '@sprint-sync/storage';
import { createUsers } from './createUsers';
import { createUserTasks } from './createUserTasks';

async function seed() {
  const source = await setupPostgres(true);
  FactoryGirl.setAdapter(new FactoryGirlTypeOrmAdapter(source));
  try {
    const { profiles } = await createUsers();
    for (const profile of profiles) {
      const user = await source.manager.findOneByOrFail(User, {
        id: profile.user_id,
      });
      await createUserTasks(user);
    }
  } finally {
    await source.destroy();
  }
}

seed()
  .then(() => console.log('seeding complete'))
  .catch((err) => console.error(err));
