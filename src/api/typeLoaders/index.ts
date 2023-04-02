import { KankaApiEntityType } from '../../types/kanka';
import api from '..';
import AbstractTypeLoader from './AbstractTypeLoader';

const loaderModules = import.meta.glob<true, '', { default: ConstructorOf<AbstractTypeLoader> }>(
    './*TypeLoader.ts',
    { eager: true },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Result = Map<KankaApiEntityType, AbstractTypeLoader<any>>;

function createTypeLoaders(): Result {
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

export default createTypeLoaders();
