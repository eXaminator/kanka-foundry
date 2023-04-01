import { KankaApiEntityType } from '../types/kanka';
import api from './api';
import AbstractTypeLoader from './TypeLoaders/AbstractTypeLoader';

const loaderModules = import.meta.glob<true, '', { default: ConstructorOf<AbstractTypeLoader> }>(
    './TypeLoaders/*TypeLoader.ts',
    { eager: true },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Result = Map<KankaApiEntityType, AbstractTypeLoader<any>>;

export default function createTypeLoaders(): Result {
    const loaders: Result = new Map();

    Object.keys(loaderModules).forEach((key) => {
        if (key.includes('Abstract')) return; // Ignore abstract base class

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Loader = loaderModules[key].default;

        if (Loader) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instance: AbstractTypeLoader<any> = new Loader(api);
            const type = instance.getType();
            loaders.set(type, instance);
        }
    });

    return loaders;
}
