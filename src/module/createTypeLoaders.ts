import type KankaApi from '../api/KankaApi';
import { KankaApiEntityType } from '../types/kanka';
import AbstractTypeLoader from './TypeLoaders/AbstractTypeLoader';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Result = Map<KankaApiEntityType, AbstractTypeLoader<any>>;

export default function createTypeLoaders(api: KankaApi): Result {
    const loaders: Result = new Map();
    const context = require.context('./TypeLoaders', true, /TypeLoader\.ts$/);

    context.keys().forEach((key) => {
        if (key.includes('Abstract')) return; // Ignore abstract base class

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Loader = context(key).default as any;

        if (Loader) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instance: AbstractTypeLoader<any> = new Loader(api);
            const type = instance.getType();
            loaders.set(type, instance);
        }
    });

    return loaders;
}
