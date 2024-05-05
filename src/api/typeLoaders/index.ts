import api from '..';
import type { KankaApiEntityType } from '../../types/kanka';
import type AbstractTypeLoader from './AbstractTypeLoader';

const loaderModules = import.meta.glob<true, '', { default: ConstructorOf<AbstractTypeLoader> }>('./*TypeLoader.ts', {
    eager: true,
});

type Result = Map<KankaApiEntityType, AbstractTypeLoader<any>>;

function createTypeLoaders(): Result {
    const loaders: Result = new Map();

    for (const key in loaderModules) {
        if (key.includes('Abstract')) continue; // Ignore abstract base class

        const Loader: ConstructorOf<AbstractTypeLoader<any>> = loaderModules[key].default;

        if (Loader) {
            const instance: AbstractTypeLoader<any> = new Loader(api);
            const type = instance.getType();
            loaders.set(type, instance);
        }
    }

    return loaders;
}

export default createTypeLoaders();
