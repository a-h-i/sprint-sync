import { DataSource, DataSourceOptions } from 'typeorm';
import assert from 'assert';
import { migrations } from './migrations';
import { models } from './models';

export function getPgConfig(runMigrations = false): DataSourceOptions {
  const masterHost = process.env.PG_MASTER_HOST;
  const masterPort = process.env.PG_MASTER_PORT;
  const user = process.env.PG_USER;
  const password = process.env.PG_PASSWORD;
  const db = process.env.PG_DB;
  assert(masterHost != null, 'pg host must be provided');
  assert(masterPort != null, 'pg port must be provided');
  assert(user != null, 'pg user must be provided');
  assert(password != null, 'pg password must be provided');
  assert(db != null, 'pg db must be provided');
  return {
    type: 'postgres',
    replication: {
      master: {
        host: masterHost,
        port: Number.parseInt(masterPort, 10),
        username: user,
        password: password,
        database: db,
      },
      slaves: [],
    },
    poolSize: Number.parseInt(process.env.PG_POOL_SIZE ?? '10', 10),
    synchronize: false,
    migrationsRun: runMigrations,
    entities: models,
    migrations,
    connectTimeoutMS: 60 * 1000,
    extra: {
      connectionTimeoutMillis: 60 * 1000,
      idleTimeoutMillis: 0,
      application_name: 'sprint_sync',
    },
    logging: ['warn', 'error', 'migration'],
  };
}

function createPgDataSource(runMigrations: boolean): DataSource {
  return new DataSource(getPgConfig(runMigrations));
}

export async function setupPostgres(runMigrations = false) {
  const datasource = createPgDataSource(runMigrations);
  await datasource.initialize();
  return datasource;
}
