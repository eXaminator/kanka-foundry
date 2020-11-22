import type EntityBase from './entities/EntityBase';

export default interface EntityConstructor<T extends EntityBase = EntityBase> {
    new(api: T['api'], data: T['data'], parent: T['parent']): T
}
