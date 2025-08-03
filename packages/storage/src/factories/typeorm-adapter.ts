import { BaseEntity, DataSource, EntityManager } from 'typeorm';

type AdapterBaseEntity = BaseEntity & Record<string, unknown>;

export class FactoryGirlTypeOrmAdapter {
  constructor(private dataSource: DataSource) {}

  build(
    modelClass: new () => AdapterBaseEntity,
    props: Record<string, unknown>,
  ) {
    const model = new modelClass();
    for (const [key, value] of Object.entries(props)) {
      model[key] = value;
    }
    return model as unknown;
  }

  async save<T extends AdapterBaseEntity>(model: T): Promise<T> {
    return this.dataSource.manager.save(model);
  }

  async destroy(
    model: AdapterBaseEntity,
    modelClass: Parameters<(typeof EntityManager.prototype)['findOne']>[0],
  ) {
    const manager = this.dataSource.manager;
    const id = BaseEntity.getId(model);
    const theModel = await manager.findOneBy(modelClass, {
      id,
    });
    if (theModel) {
      await manager.delete(modelClass, id);
    } else {
      return;
    }
  }

  get(model: AdapterBaseEntity, attr: string) {
    return model[attr];
  }

  set(props: Record<string, unknown>, model: Record<string, unknown>) {
    Object.keys(props).forEach((key) => {
      model[key] = props[key];
    });
    return model as unknown;
  }
}
