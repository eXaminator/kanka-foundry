import { MetaDataType } from '../types/KankaSettings';

export default interface EntityMetaData<T extends unknown = unknown> {
    type: MetaDataType;
    section: string;
    label: string;
    value: unknown;
    originalData?: T;
}
