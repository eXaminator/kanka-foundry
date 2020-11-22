import { MetaDataType } from '../../types/KankaSettings';
import type PrimaryEntity from './PrimaryEntity';

export default interface EntityMetaData<
    T extends unknown = unknown,
    E extends PrimaryEntity = PrimaryEntity
> {
    type: MetaDataType;
    section: string;
    label: string;
    value: unknown;
    originalData?: T;
    linkTo?: E;
}
