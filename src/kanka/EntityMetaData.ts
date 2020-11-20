import { MetaDataType } from '../types/KankaSettings';
import type KankaEntity from './KankaEntity';

export default interface EntityMetaData<
    T extends unknown = unknown,
    E extends KankaEntity = KankaEntity
> {
    type: MetaDataType;
    section: string;
    label: string;
    value: unknown;
    originalData?: T;
    linkTo?: E;
}
